import type { Response } from "express";
import prisma from "../prisma/client.js";
import type { AuthRequest } from "../middleware/authmiddleware.js";
import {
  createSignedDownloadUrl,
  deleteUploadedFile,
  saveUploadedFile,
} from "../utils/fileStorage.js";
import { sendStoredFile } from "../utils/sendStoredFile.js";
import { parseNoteId } from "../utils/params.js";

const findOwnedAttachment = async (attachmentId: string, userId: number) => {
  return prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      note: {
        userId,
      },
    },
  });
};

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const noteId = parseNoteId(req.body?.noteId);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (!noteId) {
      return res.status(400).json({
        message: "noteId is required",
      });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const file = req.file;
    const s3Key = await saveUploadedFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        s3Key,
        noteId,
      },
    });

    res.status(201).json({
      message: "File uploaded successfully",
      attachment: {
        id: attachment.id,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        createdAt: attachment.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      message: "File upload failed",
    });
  }
};

export const getFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const attachment = await findOwnedAttachment(
      String(req.params.id),
      userId
    );

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    await sendStoredFile(res, attachment);
  } catch (error) {
    console.error("Read file error:", error);
    res.status(500).json({
      message: "Failed to load file",
    });
  }
};

export const getFileAccess = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const attachment = await findOwnedAttachment(
      String(req.params.id),
      userId
    );

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    const url = await createSignedDownloadUrl(
      attachment.s3Key,
      attachment.fileName
    );

    res.json({
      url,
      expiresIn: url ? 120 : null,
    });
  } catch (error) {
    console.error("File access error:", error);
    res.status(500).json({
      message: "Failed to open file",
    });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const attachment = await findOwnedAttachment(
      String(req.params.id),
      userId
    );

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    await deleteUploadedFile(attachment.s3Key);
    await prisma.attachment.delete({
      where: { id: attachment.id },
    });

    res.json({
      message: "Attachment deleted",
    });
  } catch (error) {
    console.error("Delete attachment error:", error);
    res.status(500).json({
      message: "Failed to delete attachment",
    });
  }
};
