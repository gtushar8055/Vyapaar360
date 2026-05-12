import express from "express";
import {
  getCustomers,
  getCustomerHistory,
  receivePayment,
  searchCustomers,
} from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCustomers);
router.get("/search", protect, searchCustomers);
router.get("/:phone/history", protect, getCustomerHistory);
router.post("/:phone/receive-payment", protect, receivePayment);

export default router;
