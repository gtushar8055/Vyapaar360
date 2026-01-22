import express from "express";
import { getMonthlyGstSummary } from "../controllers/gstController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getMonthlyGstSummary);

export default router;
