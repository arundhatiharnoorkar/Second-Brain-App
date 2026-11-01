import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NoteAttachments from "../components/NoteAttachments";
import { API, getErrorMessage } from "../lib/http";
import type { SharedNote as SharedNoteData } from "../types";

function SharedNote() {
  const { token } = useParams();
  const [note, setNote] = useState<SharedNoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token) {
        setError("This shared note is unavailable.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<SharedNoteData>(
          `${API}/api/shares/${encodeURIComponent(token)}`
        );

        if (!cancelled) {
          setNote(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, "This shared note is unavailable."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const tags = (note?.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 text-gray-900 sm:p-6">
      <p className="mb-4 text-center text-sm font-semibold text-indigo-600">
        Shared note · read only
      </p>

      {loading && (
        <p className="py-16 text-center font-semibold text-indigo-500">Loading shared note...</p>
      )}

      {!loading && error && (
        <section className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold">Note unavailable</h1>
          <p className="text-sm text-gray-600">{error}</p>
        </section>
      )}

      {!loading && note && (
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
          <h1 className="mb-3 text-2xl font-bold">{note.title}</h1>
          <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
            {note.content}
          </p>

          {note.category && (
            <p className="mb-3">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                📁 {note.category}
              </span>
            </p>
          )}

          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {token && (
            <NoteAttachments
              attachments={note.attachments || []}
              darkMode={false}
              filesBaseUrl={`${API}/api/shares/${encodeURIComponent(token)}/attachments`}
              withAuth={false}
            />
          )}
        </article>
      )}
    </main>
  );
}

export default SharedNote;
