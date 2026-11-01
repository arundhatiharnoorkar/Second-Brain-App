import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API, authHeaders } from "../lib/http";
import type { Attachment } from "../types";

export type { Attachment };

type NoteAttachmentsProps = {
  attachments: Attachment[];
  darkMode: boolean;
  onDeleted?: () => void;
  filesBaseUrl?: string;
  withAuth?: boolean;
};

const formatSize = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatType = (fileType: string) => fileType || "Unknown type";

function AttachmentItem({
  attachment,
  darkMode,
  onDeleted,
  fileUrl,
  withAuth,
}: {
  attachment: Attachment;
  darkMode: boolean;
  onDeleted?: () => void;
  fileUrl: string;
  withAuth: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    setLoading(true);

    axios
      .get(fileUrl, {
        responseType: "blob",
        headers: withAuth ? authHeaders() : undefined,
      })
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(`Could not load ${attachment.fileName}`);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment.fileName, fileUrl, withAuth]);

  const remove = async () => {
    if (!onDeleted) {
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`${API}/api/uploads/${attachment.id}`, {
        headers: authHeaders(),
      });
      toast.success("Attachment removed");
      onDeleted();
    } catch {
      toast.error("Failed to remove attachment");
    } finally {
      setDeleting(false);
    }
  };

  const downloadBlob = () => {
    if (!src) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.download = attachment.fileName;
    anchor.click();
  };

  const openFile = async () => {
    if (!withAuth) {
      downloadBlob();
      return;
    }

    try {
      setOpening(true);
      const response = await axios.get<{ url: string | null }>(
        `${API}/api/uploads/${attachment.id}/access`,
        { headers: authHeaders() }
      );

      if (response.data.url) {
        window.open(response.data.url, "_blank", "noopener,noreferrer");
        return;
      }
    } catch {
      toast.error(`Could not open ${attachment.fileName}`);
    } finally {
      setOpening(false);
    }

    downloadBlob();
  };

  const isImage = attachment.fileType.startsWith("image/") && attachment.fileType !== "image/svg+xml";
  const isVideo = attachment.fileType.startsWith("video/");
  const isAudio = attachment.fileType.startsWith("audio/");
  const size = formatSize(attachment.fileSize);

  return (
    <div
      className={
        darkMode
          ? "rounded-xl border border-gray-700 bg-gray-800/70 p-3"
          : "rounded-xl border border-gray-200 bg-gray-50 p-3"
      }
    >
      {loading && (
        <p className={darkMode ? "mb-2 text-xs text-gray-400" : "mb-2 text-xs text-gray-500"}>
          Loading preview...
        </p>
      )}

      {src && isImage && (
        <img
          src={src}
          alt={attachment.fileName}
          className="mb-2 max-h-64 w-full rounded-lg object-contain"
        />
      )}

      {src && isVideo && (
        <video
          src={src}
          controls
          className="mb-2 max-h-64 w-full rounded-lg"
        />
      )}

      {src && isAudio && (
        <audio src={src} controls className="mb-2 w-full" />
      )}

      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="min-w-0">
          <p className="truncate font-medium">{attachment.fileName}</p>
          <p className={darkMode ? "text-xs text-gray-400" : "text-xs text-gray-500"}>
            {formatType(attachment.fileType)}
            {size ? ` · ${size}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={openFile}
            disabled={opening || (!src && !withAuth)}
            aria-label={`Download ${attachment.fileName}`}
            className={
              darkMode
                ? "rounded-lg bg-gray-700 px-2.5 py-1 text-xs font-semibold disabled:opacity-50"
                : "rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold disabled:opacity-50"
            }
          >
            {opening ? "Opening..." : "Download"}
          </button>
          {onDeleted && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              aria-label={`Remove ${attachment.fileName}`}
              className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteAttachments({
  attachments,
  darkMode,
  onDeleted,
  filesBaseUrl = `${API}/api/uploads`,
  withAuth = true,
}: NoteAttachmentsProps) {
  if (!attachments?.length) {
    return null;
  }

  return (
    <section className="mb-4" aria-label="Attachments">
      <h4 className="mb-2 text-sm font-semibold">Attachments</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            darkMode={darkMode}
            onDeleted={onDeleted}
            fileUrl={`${filesBaseUrl}/${attachment.id}/file`}
            withAuth={withAuth}
          />
        ))}
      </div>
    </section>
  );
}

export default NoteAttachments;
