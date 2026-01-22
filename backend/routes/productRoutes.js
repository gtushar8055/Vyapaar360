import express from "express";
import { getProducts , updateProductPricing } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.patch("/:id", protect, updateProductPricing);

export default router;


