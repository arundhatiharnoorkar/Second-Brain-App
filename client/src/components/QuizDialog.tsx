import { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeaders, getErrorMessage } from "../lib/http";
import type { Note, QuizQuestion } from "../types";

type QuizDialogProps = {
  note: Note;
  darkMode: boolean;
  onClose: () => void;
};

const isQuizQuestion = (value: unknown): value is QuizQuestion => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const question = value as QuizQuestion;

  return (
    typeof question.question === "string" &&
    question.question.trim().length > 0 &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every((option) => typeof option === "string" && option.trim()) &&
    Number.isInteger(question.correctIndex) &&
    question.correctIndex >= 0 &&
    question.correctIndex < 4 &&
    typeof question.explanation === "string" &&
    question.explanation.trim().length > 0
  );
};

function QuizDialog({ note, darkMode, onClose }: QuizDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [submitted, setSubmitted] = useState(false);

  const loadQuiz = async (cancelled?: () => boolean) => {
    if (note.content.trim().length < 40) {
      setQuestions([]);
      setError(
        "This note does not have enough content to build a quiz. Add more detail, then try again."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setIndex(0);

      const response = await axios.post<{ questions: unknown }>(
        `${API}/api/ai/quiz/${note.id}`,
        {},
        { headers: authHeaders() }
      );

      if (cancelled?.()) {
        return;
      }

      const incoming = Array.isArray(response.data.questions)
        ? response.data.questions.filter(isQuizQuestion)
        : [];

      if (incoming.length === 0) {
        setQuestions([]);
        setError("The quiz could not be read. Please try generating it again.");
        return;
      }

      setQuestions(incoming.slice(0, 5));
      setAnswers(incoming.slice(0, 5).map(() => null));
    } catch (loadError) {
      if (!cancelled?.()) {
        setQuestions([]);
        setError(getErrorMessage(loadError, "Failed to generate quiz"));
      }
    } finally {
      if (!cancelled?.()) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadQuiz(() => cancelled);

    return () => {
      cancelled = true;
    };
    // The quiz is generated for the note that opened the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  const current = questions[index];
  const score = questions.reduce(
    (total, question, questionIndex) =>
      total + (answers[questionIndex] === question.correctIndex ? 1 : 0),
    0
  );

  const selectAnswer = (optionIndex: number) => {
    if (submitted) {
      return;
    }

    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, answerIndex) =>
        answerIndex === index ? optionIndex : answer
      )
    );
  };

  const panel = darkMode
    ? "bg-gray-900 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-title"
        className={`${panel} max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="quiz-title" className="text-lg font-bold">
              Quiz
            </h2>
            <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>
              {note.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz"
            className="font-bold text-red-600"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-8 font-semibold text-indigo-500" aria-live="polite">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating quiz from this note...
          </div>
        )}

        {!loading && error && (
          <div className="space-y-3">
            <p className="rounded-lg border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
            <button
              type="button"
              onClick={() => loadQuiz()}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && submitted && (
          <div className="space-y-4">
            <p className="text-2xl font-bold text-indigo-500">
              Score: {score}/{questions.length}
            </p>
            {questions.map((question, questionIndex) => {
              const selected = answers[questionIndex];
              const correct = selected === question.correctIndex;

              return (
                <div
                  key={question.question}
                  className={
                    darkMode
                      ? "rounded-xl border border-gray-700 p-4"
                      : "rounded-xl border border-gray-200 p-4"
                  }
                >
                  <p className="mb-2 font-semibold">
                    {questionIndex + 1}. {question.question}
                  </p>
                  <p className={correct ? "text-sm font-semibold text-emerald-500" : "text-sm font-semibold text-red-500"}>
                    {correct ? "Correct" : "Incorrect"}
                  </p>
                  <p className="mt-1 text-sm">
                    Answer: {question.options[question.correctIndex]}
                  </p>
                  {selected !== null && selected !== undefined && !correct && (
                    <p className={darkMode ? "text-sm text-gray-300" : "text-sm text-gray-600"}>
                      Your answer: {question.options[selected]}
                    </p>
                  )}
                  <p className={darkMode ? "mt-2 text-sm text-gray-300" : "mt-2 text-sm text-gray-600"}>
                    {question.explanation}
                  </p>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setAnswers(questions.map(() => null));
                setIndex(0);
                setSubmitted(false);
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Retake Quiz
            </button>
          </div>
        )}

        {!loading && !error && !submitted && current && (
          <div>
            <p className={darkMode ? "mb-3 text-xs text-gray-400" : "mb-3 text-xs text-gray-500"}>
              Question {index + 1} of {questions.length}
            </p>
            <fieldset>
              <legend className="mb-3 text-base font-semibold">{current.question}</legend>
              <div className="space-y-2">
                {current.options.map((option, optionIndex) => {
                  const selected = answers[index] === optionIndex;

                  return (
                    <label
                      key={option}
                      className={
                        selected
                          ? "flex cursor-pointer items-start gap-3 rounded-xl border border-indigo-500 bg-indigo-500/10 p-3"
                          : darkMode
                            ? "flex cursor-pointer items-start gap-3 rounded-xl border border-gray-700 p-3"
                            : "flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3"
                      }
                    >
                      <input
                        type="radio"
                        name={`quiz-question-${index}`}
                        checked={selected}
                        onChange={() => selectAnswer(optionIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => setIndex((value) => value - 1)}
                className="rounded-xl bg-gray-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Previous
              </button>
              {index < questions.length - 1 ? (
                <button
                  type="button"
                  disabled={answers[index] === null || answers[index] === undefined}
                  onClick={() => setIndex((value) => value + 1)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    submitted ||
                    answers.length !== questions.length ||
                    answers.some((answer) => answer === null)
                  }
                  onClick={() => {
                    if (submitted) {
                      return;
                    }
                    setSubmitted(true);
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizDialog;
