import express from "express";
import { summarizeNote } from "../controllers/aicontroller.js";
import {authMiddleware} from "../middleware/authmiddleware.js";

const router = express.Router();

router.post(
  "/summarize/:id",
  authMiddleware,
  summarizeNote
);

export default router;