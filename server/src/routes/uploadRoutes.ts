import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import upload from "../middleware/upload.js";
import {
  deleteAttachment,
  getFile,
  getFileAccess,
  uploadFile,
} from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = Router();

const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File is too large. Maximum size is 100MB.",
        });
      }

      return res.status(400).json({
        message: err.message,
      });
    }

    if (err) {
      return res.status(400).json({
        message: "File upload failed",
      });
    }

    next();
  });
};

router.post("/", authMiddleware, handleUpload, uploadFile);
router.get("/:id/access", authMiddleware, getFileAccess);
router.get("/:id/file", authMiddleware, getFile);
router.delete("/:id", authMiddleware, deleteAttachment);

export default router;
