export type QuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export const MIN_NOTE_LENGTH = 40;

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const asOptions = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const options = value
    .filter((option): option is string => typeof option === "string")
    .map((option) => option.trim())
    .filter(Boolean);

  if (options.length < 4) {
    return null;
  }

  return options.slice(0, 4);
};

const resolveCorrectIndex = (
  record: Record<string, unknown>,
  options: string[]
) => {
  const indexed = record.correctIndex ?? record.answerIndex;

  if (typeof indexed === "number" && indexed >= 0 && indexed < 4) {
    return indexed;
  }

  if (typeof indexed === "string" && /^[0-3]$/.test(indexed.trim())) {
    return Number(indexed.trim());
  }

  const answer = record.answer ?? record.correctAnswer ?? record.correct;

  if (typeof answer === "number" && answer >= 0 && answer < 4) {
    return answer;
  }

  if (typeof answer !== "string") {
    return null;
  }

  const trimmed = answer.trim();
  const letter = trimmed.toUpperCase();

  if (/^[A-D]$/.test(letter)) {
    return letter.charCodeAt(0) - 65;
  }

  const match = options.findIndex(
    (option) => option.toLowerCase() === trimmed.toLowerCase()
  );

  return match >= 0 ? match : null;
};

const parseQuestion = (value: unknown): QuizQuestion | null => {
  const record = asRecord(value);

  if (!record || typeof record.question !== "string") {
    return null;
  }

  const question = record.question.trim();
  const options = asOptions(record.options ?? record.choices);

  if (!question || !options) {
    return null;
  }

  const correctIndex = resolveCorrectIndex(record, options);
  const [first, second, third, fourth] = options;

  if (
    correctIndex === null ||
    !first ||
    !second ||
    !third ||
    !fourth
  ) {
    return null;
  }

  const explanation =
    typeof record.explanation === "string" && record.explanation.trim()
      ? record.explanation.trim()
      : "This choice is the one supported by the note.";

  return {
    question,
    options: [first, second, third, fourth],
    correctIndex,
    explanation,
  };
};

export const parseQuizResponse = (text: string): QuizQuestion[] => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1]?.trim() || trimmed;
  const start = body.indexOf("{");
  const arrayStart = body.indexOf("[");
  const jsonStart =
    start === -1
      ? arrayStart
      : arrayStart === -1
        ? start
        : Math.min(start, arrayStart);

  if (jsonStart === -1) {
    throw new Error("Quiz response did not contain JSON");
  }

  const endObject = body.lastIndexOf("}");
  const endArray = body.lastIndexOf("]");
  const jsonEnd = Math.max(endObject, endArray);

  if (jsonEnd <= jsonStart) {
    throw new Error("Quiz response JSON was incomplete");
  }

  const parsed: unknown = JSON.parse(body.slice(jsonStart, jsonEnd + 1));
  const record = asRecord(parsed);
  const list = Array.isArray(parsed)
    ? parsed
    : record && Array.isArray(record.questions)
      ? record.questions
      : null;

  if (!list) {
    throw new Error("Quiz response did not include questions");
  }

  const questions: QuizQuestion[] = [];

  for (const item of list) {
    const question = parseQuestion(item);

    if (question) {
      questions.push(question);
    }

    if (questions.length === 5) {
      break;
    }
  }

  if (questions.length === 0) {
    throw new Error("Quiz response did not include valid questions");
  }

  return questions;
};
