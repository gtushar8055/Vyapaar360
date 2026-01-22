import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";

export const getMonthlyGstSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Month and year are required" });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));


    // Input GST (Purchases)
    const purchases = await Purchase.find({
      purchaseDate: { $gte: startDate, $lt: endDate },
    });

    const totalInputGst = purchases.reduce(
      (sum, p) => sum + p.totalGst,
      0
    );

    // Output GST (Sales)
    const sales = await Sale.find({
      saleDate: { $gte: startDate, $lt: endDate },
    });

    const totalOutputGst = sales.reduce(
      (sum, s) => sum + s.totalGst,
      0
    );

    const netGstPayable = totalOutputGst - totalInputGst;

    res.json({
      month,
      year,
      totalInputGst,
      totalOutputGst,
      netGstPayable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
