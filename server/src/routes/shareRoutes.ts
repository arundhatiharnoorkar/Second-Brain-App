import { Router } from "express";
import {
  getSharedAttachment,
  getSharedNote,
} from "../controllers/shareController.js";

const router = Router();

router.get("/:token/attachments/:attachmentId/file", getSharedAttachment);
router.get("/:token", getSharedNote);

export default router;
