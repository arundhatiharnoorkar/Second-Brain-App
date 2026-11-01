import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API, authHeaders, getErrorMessage } from "../lib/http";
import type { ShareStatus } from "../types";

type ShareNoteDialogProps = {
  noteId: number;
  noteTitle: string;
  darkMode: boolean;
  onClose: () => void;
};

function ShareNoteDialog({
  noteId,
  noteTitle,
  darkMode,
  onClose,
}: ShareNoteDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ShareStatus>({
    active: false,
    includeAttachments: false,
  });
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [error, setError] = useState("");

  const link = status.token
    ? `${window.location.origin}/share/${status.token}`
    : "";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await axios.get<ShareStatus>(
          `${API}/api/notes/${noteId}/share`,
          { headers: authHeaders() }
        );

        if (cancelled) {
          return;
        }

        setStatus(response.data);
        setIncludeAttachments(response.data.includeAttachments);
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, "Could not load sharing settings"));
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
  }, [noteId]);

  const enable = async (regenerate: boolean) => {
    try {
      setSaving(true);
      setError("");
      const response = await axios.post<ShareStatus>(
        `${API}/api/notes/${noteId}/share`,
        {
          includeAttachments,
          regenerate,
        },
        { headers: authHeaders() }
      );
      setStatus(response.data);
      setIncludeAttachments(response.data.includeAttachments);
      toast.success(regenerate ? "New share link created" : "Share link ready");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Could not create a share link"));
    } finally {
      setSaving(false);
    }
  };

  const updateAttachments = async (next: boolean) => {
    setIncludeAttachments(next);

    if (!status.active) {
      return;
    }

    try {
      setSaving(true);
      const response = await axios.patch<ShareStatus>(
        `${API}/api/notes/${noteId}/share`,
        { includeAttachments: next },
        { headers: authHeaders() }
      );
      setStatus(response.data);
      toast.success(
        next
          ? "Shared page can show attachments"
          : "Attachments hidden from the shared page"
      );
    } catch (saveError) {
      setIncludeAttachments(!next);
      toast.error(getErrorMessage(saveError, "Could not update sharing settings"));
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    try {
      setSaving(true);
      setError("");
      const response = await axios.delete<ShareStatus>(
        `${API}/api/notes/${noteId}/share`,
        { headers: authHeaders() }
      );
      setStatus(response.data);
      setIncludeAttachments(false);
      toast.success("Share link revoked");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Could not revoke the share link"));
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const panel = darkMode
    ? "bg-gray-900 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-note-title"
        className={`${panel} w-full max-w-lg rounded-2xl p-5 shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="share-note-title" className="text-lg font-bold">
              Share note
            </h2>
            <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>
              {noteTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sharing dialog"
            className="font-bold text-red-600"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-sm font-semibold text-indigo-500">Loading sharing settings...</p>
        ) : (
          <div className="space-y-4">
            <p className={darkMode ? "text-sm text-gray-300" : "text-sm text-gray-600"}>
              {status.active
                ? "Anyone with this link can read this note. Other notes stay private."
                : "This note is private. Generate a link when you want someone to read it."}
            </p>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeAttachments}
                disabled={saving}
                onChange={(event) => updateAttachments(event.target.checked)}
              />
              <span>Include attachments on the shared page</span>
            </label>

            {status.active && link && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={link}
                  aria-label="Share link"
                  className={
                    darkMode
                      ? "w-full rounded-xl border border-gray-600 bg-gray-800 p-3 text-sm"
                      : "w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm"
                  }
                />
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Copy link
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-300 bg-red-100 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {status.active ? (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => enable(true)}
                    className="rounded-xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Working..." : "New link"}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={revoke}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Revoke link
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => enable(false)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Working..." : "Generate link"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareNoteDialog;
