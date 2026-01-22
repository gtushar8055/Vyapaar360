import express from "express";
import {
  downloadTodayReport,
  downloadMonthlyReport,
  downloadSalesSummaryReport,
} from "../controllers/reportsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, downloadTodayReport);
router.get("/monthly", protect, downloadMonthlyReport);
router.get("/sales-summary", protect, downloadSalesSummaryReport);


export default router;
