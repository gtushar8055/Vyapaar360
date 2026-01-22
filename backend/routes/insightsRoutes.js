import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSmartInsights } from "../controllers/insightsController.js";

const router = express.Router();

router.get("/", protect, getSmartInsights);

export default router;
