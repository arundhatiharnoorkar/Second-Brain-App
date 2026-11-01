import express from "express";
import { generateQuiz, summarizeNote } from "../controllers/aicontroller.js";
import {authMiddleware} from "../middleware/authmiddleware.js";

const router = express.Router();

router.post(
  "/summarize/:id",
  authMiddleware,
  summarizeNote
);

router.post(
  "/quiz/:id",
  authMiddleware,
  generateQuiz
);

export default router;