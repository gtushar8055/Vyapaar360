import express from "express";
import {
  createSale,
  getSales,
  generateInvoice,
} from "../controllers/salesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSale);      
router.get("/", protect, getSales);         
router.get("/:saleId/invoice", protect, generateInvoice);

export default router;
