import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Inventory from "../models/Inventory.js";

export const getDashboardData = async (req, res) => {
  try {
    const shopId = req.shop._id;

    /* ===================== DATE RANGES ===================== */

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      1,
    );

    /* ===================== KPI CALCULATIONS ===================== */
    const todaySalesAgg = await Sale.aggregate([
      {
        $match: {
          shop: shopId,
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$grandTotal", "$totalAmount"],
            },
          },
          totalGst: { $sum: "$totalGst" },
        },
      },
    ]);

    // MONTHLY SALES
    const monthlySalesAgg = await Sale.aggregate([
      {
        $match: {
          shop: shopId,
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$grandTotal", "$totalAmount"],
            },
          },
        },
      },
    ]);

    // MONTHLY PURCHASES
    const monthlyPurchasesAgg = await Purchase.aggregate([
      {
        $match: {
          shop: shopId,
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // GST INPUT (from purchases)
    const gstInputAgg = await Purchase.aggregate([
      { $match: { shop: shopId } },
      { $group: { _id: null, total: { $sum: "$totalGst" } } },
    ]);

    // GST OUTPUT (from sales)
    const gstOutputAgg = await Sale.aggregate([
      { $match: { shop: shopId } },
      { $group: { _id: null, total: { $sum: "$totalGst" } } },
    ]);

    // LOW STOCK COUNT 
    const lowStockAgg = await Inventory.aggregate([
      {
        $match: {
          shop: shopId,
        },
      },
      {
        $project: {
          status: {
            $cond: [
              { $lte: ["$currentStock", 10] },
              "LOW",
              {
                $cond: [{ $lte: ["$currentStock", 30] }, "NORMAL", "HIGH"],
              },
            ],
          },
        },
      },
      {
        $match: { status: "LOW" },
      },
      {
        $count: "count",
      },
    ]);

    const lowStockCount = lowStockAgg[0]?.count || 0;

    /* ===================== CHARTS ===================== */
    const salesTrend = await Sale.aggregate([
      { $match: { shop: shopId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          sales: {
            $sum: {
              $ifNull: ["$grandTotal", "$totalAmount"],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const purchaseTrend = await Purchase.aggregate([
      { $match: { shop: shopId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          purchases: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ===================== RESPONSE ===================== */

    res.json({
      kpis: {
        todaySales: todaySalesAgg[0]?.total || 0,
        monthlySales: monthlySalesAgg[0]?.total || 0,
        monthlyPurchases: monthlyPurchasesAgg[0]?.total || 0,
        gstInput: gstInputAgg[0]?.total || 0,
        gstOutput: gstOutputAgg[0]?.total || 0,
        lowStockCount,
      },
      charts: {
        salesTrend,
        purchaseTrend,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Dashboard server error" });
  }
};
