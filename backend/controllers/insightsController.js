import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Inventory from "../models/Inventory.js";
import { getISTEndOfDayUTC } from "../utils/istDate.js";



/**
 * @desc    Smart Insights (Rule-based, Instant)
 * @route   GET /api/insights
*/
export const getSmartInsights = async (req, res) => {
  try {
    const shopId = req.shop._id;
    
    /* ================= DATE RANGE ================= */
    // const last30 = new Date();
    // last30.setDate(last30.getDate() - 30);
    const last30 = new Date(getISTEndOfDayUTC().getTime() - 30 * 24 * 60 * 60 * 1000);

    /* ================= SALES (LAST 30 DAYS) ================= */
    const salesAgg = await Sale.aggregate([
      { $match: { shop: shopId, createdAt: { $gte: last30 } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          qty: { $sum: "$items.quantity" },
        },
      },
    ]);

    const salesMap = {};
    salesAgg.forEach(s => {
      salesMap[s._id.toString()] = s.qty;
    });

    /* ================= INVENTORY ================= */
    const inventory = await Inventory.find({ shop: shopId }).populate("product");

    let deadStock = [];
    let reorderSuggestions = [];
    let lowStockCount = 0;

    inventory.forEach(inv => {
      if (!inv.product) return;

      const productId = inv.product._id.toString();
      const soldQty = salesMap[productId] || 0;
      const avgDailySales = soldQty / 30;

      if (soldQty === 0 && inv.currentStock > 0) {
        deadStock.push(inv.product.name);
      }

      if (inv.currentStock <= 10) {
        lowStockCount++;
      }

      const suggestedQty = Math.ceil(avgDailySales * 7 - inv.currentStock);
      if (suggestedQty > 0) {
        reorderSuggestions.push({
          product: inv.product.name,
          qty: suggestedQty,
        });
      }
    });

    /* ================= CASH FLOW ================= */
    const [salesSum] = await Sale.aggregate([
      { $match: { shop: shopId } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);

    const [purchaseSum] = await Purchase.aggregate([
      { $match: { shop: shopId } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalSales = salesSum?.total || 0;
    const totalPurchases = purchaseSum?.total || 0;

    const cashHealth =
      totalSales >= totalPurchases ? "Healthy" : "Stressed";

    /* ================= CUSTOMER PAYMENT RISK ================= */
    const creditAgg = await Sale.aggregate([
      {
        $match: {
          shop: shopId,
          pendingAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$customerPhone",
          totalPending: { $sum: "$pendingAmount" },
        },
      },
    ]);

    const totalPendingAmount = creditAgg.reduce(
      (sum, c) => sum + c.totalPending,
      0
    );

    const customersWithDues = creditAgg.length;

    const paymentRiskLevel =
      totalPendingAmount === 0
        ? "None"
        : totalPendingAmount < 5000
        ? "Low"
        : totalPendingAmount < 20000
        ? "Medium"
        : "High";

    /* ================= BUSINESS HEALTH SCORE ================= */
    let score = 100;
    score -= lowStockCount * 5;
    score -= deadStock.length * 10;
    if (paymentRiskLevel === "Medium") score -= 10;
    if (paymentRiskLevel === "High") score -= 20;
    if (cashHealth === "Stressed") score -= 20;

    score = Math.max(0, Math.round(score));

    /* ================= RESPONSE ================= */
    res.json({
      businessScore: score,
      cashHealth,

      lowStockCount,
      deadStockCount: deadStock.length,

      deadStock,
      reorderSuggestions,

      customerPaymentRisk: {
        totalPendingAmount,
        customersWithDues,
        riskLevel: paymentRiskLevel,
      },
    });
  } catch (err) {
    console.error("Smart Insights Error:", err);
    res.status(500).json({ message: "Failed to generate insights" });
  }
};
