import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { chatWithAssistant } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", protect, chatWithAssistant);

export default router;
