import type { Response } from "express";
import { model } from "../gemini.js";
import prisma from "../prisma/client.js";
import type { AuthRequest } from "../middleware/authmiddleware.js";
import { parseNoteId } from "../utils/params.js";
import { MIN_NOTE_LENGTH, parseQuizResponse } from "../utils/quiz.js";

const requireOwnedNote = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Invalid token" });
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

const aiError = (error: unknown, res: Response, fallback: string) => {
  console.error(error);

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 429
  ) {
    return res.status(429).json({
      message: "Daily AI quota exceeded. Please try again tomorrow.",
    });
  }

  return res.status(500).json({ message: fallback });
};

export const summarizeNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await requireOwnedNote(req, res);

    if (!note) {
      return;
    }

    const prompt = `
You are an AI assistant.

Summarize the following note in 3-5 concise bullet points.

Rules:
- Return only 3-5 bullet points.
- Do NOT write an introduction.
- Do NOT write "Here's the summary".
- Keep each bullet concise.
- Use simple language.
- Keep the points one below the other.
- Use only the note below.

Title:
${note.title}

Content:
${note.content}
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return res.json({
      summary,
    });
  } catch (error: unknown) {
    return aiError(error, res, "Failed to summarize note");
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const note = await requireOwnedNote(req, res);

    if (!note) {
      return;
    }

    if (note.content.trim().length < MIN_NOTE_LENGTH) {
      return res.status(400).json({
        message:
          "This note does not have enough content to build a quiz. Add more detail, then try again.",
      });
    }

    const source = note.content.slice(0, 15000);

    const prompt = `
Create a quiz that tests understanding of ONLY the note below.
Do not use outside facts. Every question and every correct answer must be supported by this note.

Return JSON only, with no markdown, in this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "one short sentence from the note"
    }
  ]
}

Rules:
- Return exactly 5 questions.
- Each question has exactly 4 options.
- correctIndex is the zero-based index of the single correct option.
- Wrong options must be plausible but not supported by the note.
- Explanations must be short and based on the note.

Title:
${note.title}

Content:
${source}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let questions;

    try {
      questions = parseQuizResponse(text);
    } catch (parseError) {
      console.error("Quiz parse error:", parseError);
      return res.status(502).json({
        message:
          "The quiz could not be read. Please try generating it again.",
      });
    }

    return res.json({ questions });
  } catch (error: unknown) {
    return aiError(error, res, "Failed to generate quiz");
  }
};
