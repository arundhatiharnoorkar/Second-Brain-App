import type { Response } from "express";
import prisma from "../prisma/client.js";
import type { AuthRequest } from "../middleware/authmiddleware.js";

export const createNote = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, content, category,tags } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        category,
        tags,
        

        userId: req.userId!,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getNotes = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const notes = await prisma.note.findMany({
        where: {
          userId: req.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.json(notes);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  export const getNoteById = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const noteId = Number(req.params.id);
  
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: req.userId,
        },
      });
  
      if (!note) {
        return res.status(404).json({
          message: "Note not found",
        });
      }
  
      res.json(note);
    } catch (error) {
        console.log(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  export const searchNotes = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const query = req.query.query as string;
  
      const notes = await prisma.note.findMany({
        where: {
          userId: req.userId,
  
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      });
  
      res.json(notes);
    } catch (error) {
      console.log(error);
  
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  export const deleteNote = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const noteId = Number(req.params.id);
  
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: req.userId,
        },
      });
  
      if (!note) {
        return res.status(404).json({
          message: "Note not found",
        });
      }
  
      await prisma.note.delete({
        where: {
          id: noteId,
        },
      });
  
      res.json({
        message: "Note deleted successfully",
      });
    } catch (error) {
      console.log(error);
  
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  export const updateNote = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const noteId = Number(req.params.id);
  
      const { title, content,category } = req.body;
  
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: req.userId,
        },
      });
  
      if (!existingNote) {
        return res.status(404).json({
          message: "Note not found",
        });
      }
  
      const updatedNote = await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
          title,
          content,
          category,
          tags,
        },
      });
  
      res.json(updatedNote);
    } catch (error) {
      console.log(error);
  
      res.status(500).json({
        message: "Server error",
      });
    }
  };


export const PinNote = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const noteId = Number(req.params.id);

    const existingNote = await prisma.note.findFirst({
      where: {
        id:noteId,
        userId:req.userId!,
        },
    });

    if (!existingNote) {
        return res.status(404).json({
          message: "Note not found",
        });
      }

      const updatedNote = await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
           isPinned:
        !existingNote.isPinned,
        },
      });
  
      res.json(updatedNote);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};