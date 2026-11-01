import type { Response } from "express";
import { readUploadedFile } from "./fileStorage.js";

const canInline = (fileType: string) => {
  if (fileType === "image/svg+xml") {
    return false;
  }

  return (
    fileType.startsWith("image/") ||
    fileType.startsWith("audio/") ||
    fileType.startsWith("video/") ||
    fileType === "application/pdf"
  );
};

const safeFileName = (fileName: string) =>
  fileName.replace(/["\r\n]/g, "_") || "download";

export const sendStoredFile = async (
  res: Response,
  file: {
    s3Key: string;
    fileName: string;
    fileType: string;
  }
) => {
  const fileBuffer = await readUploadedFile(file.s3Key);
  const disposition = canInline(file.fileType) ? "inline" : "attachment";

  res.setHeader(
    "Content-Type",
    file.fileType || "application/octet-stream"
  );
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="${safeFileName(file.fileName)}"`
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");
  res.send(fileBuffer);
};
