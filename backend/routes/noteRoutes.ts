import express from "express";
import { createNote, deleteNote, getNotes } from "../controllers/noteController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/",getNotes);
router.post("/",createNote);
router.delete("/:id",deleteNote);

export default router;