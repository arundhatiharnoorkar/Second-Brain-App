import express from "express";
import { createNote } from "../controllers/notecontroller.js";
import { getNotes } from "../controllers/notecontroller.js";
import { getNoteById } from "../controllers/notecontroller.js";
import { searchNotes} from "../controllers/notecontroller.js";
import { deleteNote } from "../controllers/notecontroller.js";
import { updateNote } from "../controllers/notecontroller.js";
import { PinNote } from "../controllers/notecontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";


const router = express.Router();

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.get("/search", authMiddleware, searchNotes);
router.get("/:id", authMiddleware, getNoteById);
router.delete("/:id", authMiddleware, deleteNote);
router.put("/:id", authMiddleware, updateNote);
router.patch("/:id",authMiddleware,PinNote)



export default router;