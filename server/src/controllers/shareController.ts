import crypto from "crypto";
import type { Response } from "express";
import prisma from "../prisma/client.js";
import type { AuthRequest } from "../middleware/authmiddleware.js";
import { parseNoteId } from "../utils/params.js";
import { sendStoredFile } from "../utils/sendStoredFile.js";

const UNAVAILABLE = "This shared note is unavailable. The link may be invalid or the owner has stopped sharing.";

const shareStatus = (share: {
  isActive: boolean;
  token: string;
  includeAttachments: boolean;
} | null) => {
  if (!share || !share.isActive) {
    return {
      active: false,
      includeAttachments: false,
    };
  }

  return {
    active: true,
    token: share.token,
    includeAttachments: share.includeAttachments,
  };
};

const requireUser = (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "Invalid token" });
    return null;
  }

  return req.userId;
};

const requireOwnedNote = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = requireUser(req, res);

  if (!userId) {
    return null;
  }

  const noteId = parseNoteId(req.params.id);

  if (!noteId) {
    res.status(400).json({ message: "Invalid note id" });
    return null;
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!note) {
    res.status(404).json({ message: "Note not found" });
    return null;
  }

  return note;
};

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export const getShareStatus = async (req: AuthRequest, res: Response) => {
  try {
    const note = await requireOwnedNote(req, res);

    if (!note) {
      return;
    }

    const share = await prisma.noteShare.findUnique({
      where: { noteId: note.id },
    });

    res.json(shareStatus(share));
  } catch (error) {
    console.error("Share status error:", error);
    res.status(500).json({ message: "Failed to load sharing settings" });
  }
};

export const enableShare = async (req: AuthRequest, res: Response) => {
  try {
    const note = await requireOwnedNote(req, res);

    if (!note) {
      return;
    }

    const includeAttachments = req.body?.includeAttachments;
    const regenerate = req.body?.regenerate;

    if (
      includeAttachments !== undefined &&
      !isBoolean(includeAttachments)
    ) {
      return res.status(400).json({
        message: "includeAttachments must be a boolean",
      });
    }

    if (regenerate !== undefined && !isBoolean(regenerate)) {
      return res.status(400).json({
        message: "regenerate must be a boolean",
      });
    }

    const existing = await prisma.noteShare.findUnique({
      where: { noteId: note.id },
    });

    if (existing?.isActive && !regenerate) {
      return res.json(shareStatus(existing));
    }

    const token = crypto.randomBytes(32).toString("base64url");
    const nextAttachments =
      includeAttachments ?? existing?.includeAttachments ?? false;

    const share = existing
      ? await prisma.noteShare.update({
          where: { noteId: note.id },
          data: {
            token,
            isActive: true,
            includeAttachments: nextAttachments,
          },
        })
      : await prisma.noteShare.create({
          data: {
            token,
            noteId: note.id,
            isActive: true,
            includeAttachments: nextAttachments,
          },
        });

    res.json(shareStatus(share));
  } catch (error) {
    console.error("Enable share error:", error);
    res.status(500).json({ message: "Failed to share note" });
  }
};

export const updateShare = async (req: AuthRequest, res: Response) => {
  try {
    const note = await requireOwnedNote(req, res);

    if (!note) {
      return;
    }

    if (!isBoolean(req.body?.includeAttachments)) {
      return res.status(400).json({
        message: "includeAttachments must be a boolean",
      });
    }

    const existing = await prisma.noteShare.findUnique({
      where: { noteId: note.id },
    });

    if (!existing || !existing.isActive) {
      return res.status(404).json({
        message: "Sharing is not enabled for this note",
      });
    }

    const share = await prisma.noteShare.update({
      where: { noteId: note.id },
      data: {
        includeAttachments: req.body.includeAttachments,
      },
    });

    res.json(shareStatus(share));
  } catch (error) {
    console.error("Update share error:", error);
    res.status(500).json({ message: "Failed to update sharing settings" });
  }
};

export const revokeShare = async (req: AuthRequest, res: Response) => {
  try {
    const note = await requireOwnedNote(req, res);

    if (!note) {
      return;
    }

    const existing = await prisma.noteShare.findUnique({
      where: { noteId: note.id },
    });

    if (!existing || !existing.isActive) {
      return res.json({
        active: false,
        includeAttachments: false,
      });
    }

    await prisma.noteShare.update({
      where: { noteId: note.id },
      data: {
        isActive: false,
        token: crypto.randomBytes(32).toString("base64url"),
      },
    });

    res.json({
      active: false,
      includeAttachments: false,
    });
  } catch (error) {
    console.error("Revoke share error:", error);
    res.status(500).json({ message: "Failed to stop sharing" });
  }
};

const findActiveShare = async (token: string) => {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) {
    return null;
  }

  const share = await prisma.noteShare.findUnique({
    where: { token },
    include: {
      note: {
        include: {
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              fileSize: true,
              s3Key: true,
            },
          },
        },
      },
    },
  });

  if (!share?.isActive) {
    return null;
  }

  return share;
};

export const getSharedNote = async (req: AuthRequest, res: Response) => {
  try {
    const share = await findActiveShare(String(req.params.token || ""));

    if (!share) {
      return res.status(404).json({ message: UNAVAILABLE });
    }

    res.json({
      title: share.note.title,
      content: share.note.content,
      tags: share.note.tags,
      category: share.note.category,
      attachments: share.includeAttachments
        ? share.note.attachments.map((attachment) => ({
            id: attachment.id,
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
          }))
        : [],
    });
  } catch (error) {
    console.error("Shared note error:", error);
    res.status(500).json({ message: "Failed to load shared note" });
  }
};

export const getSharedAttachment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const share = await findActiveShare(String(req.params.token || ""));
    const attachmentId = String(req.params.attachmentId || "");

    if (!share || !share.includeAttachments) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const attachment = share.note.attachments.find(
      (item) => item.id === attachmentId
    );

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    await sendStoredFile(res, attachment);
  } catch (error) {
    console.error("Shared attachment error:", error);
    res.status(500).json({ message: "Failed to load file" });
  }
};
