import { model } from "../gemini.js";
import prisma from "../prisma/client.js";
import type { Request, Response } from "express";

export const summarizeNote = async (
  req: Request,
  res: Response
) => { try{

    const noteId = Number(req.params.id);

    const note = await prisma.note.findUnique({
  where: {
    id: noteId,
  },
});

if (!note) {
  return res.status(404).json({
    message: "Note not found",
  });
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

}
catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to summarize note",
    });
}
};
