import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/s3.js";

const uploadsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads"
);

const useS3 = () => Boolean(process.env.AWS_S3_BUCKET);
const isS3Key = (key: string) => key.startsWith("attachments/");

const sanitizeName = (name: string) =>
  path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_") || "file";

export const saveUploadedFile = async (file: {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}) => {
  const fileName = `${crypto.randomUUID()}-${sanitizeName(file.originalname)}`;

  if (useS3()) {
    const s3Key = `attachments/${fileName}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    return s3Key;
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, fileName), file.buffer);
  return fileName;
};

export const readUploadedFile = async (s3Key: string) => {
  if (isS3Key(s3Key)) {
    const result = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      })
    );

    const bytes = await result.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error("Empty S3 object");
    }

    return Buffer.from(bytes);
  }

  return fs.readFile(path.join(uploadsDir, path.basename(s3Key)));
};

export const createSignedDownloadUrl = async (
  s3Key: string,
  fileName: string
) => {
  if (!isS3Key(s3Key) || !process.env.AWS_S3_BUCKET) {
    return null;
  }

  const safeName = fileName.replace(/["\r\n]/g, "_") || "download";
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${safeName}"`,
  });

  return getSignedUrl(s3, command, { expiresIn: 120 });
};

export const deleteUploadedFile = async (s3Key: string) => {
  try {
    if (isS3Key(s3Key)) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: s3Key,
        })
      );
      return;
    }

    await fs.unlink(path.join(uploadsDir, path.basename(s3Key)));
  } catch (error) {
    console.error("Failed to delete uploaded file:", error);
  }
};
