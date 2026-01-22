import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";

/* ================= GET ALL CUSTOMERS (SHOP SAFE) ================= */
export const getCustomers = async (req, res) => {
  try {
    /* ONLY CURRENT SHOP */
    const customers = await Customer.find({
      shop: req.shop._id,
    });

    const result = [];

    for (const c of customers) {
      const sales = await Sale.find({
        customerPhone: c.phone,
        shop: req.shop._id,
      });

      let totalSpent = 0;
      let totalReceived = 0;
      let totalPending = 0;

      for (const s of sales) {
        const received = s.amountReceived ?? s.grandTotal;
        const pending = s.pendingAmount ?? 0;

        totalSpent += s.grandTotal;
        totalReceived += received;
        totalPending += pending;
      }

      result.push({
        ...c.toObject(),
        totalSpent,
        totalReceived,
        totalPending,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

/* ================= CUSTOMER HISTORY (SHOP SAFE) ================= */
export const getCustomerHistory = async (req, res) => {
  try {
    const { phone } = req.params;

    const sales = await Sale.find({
      customerPhone: phone,
      shop: req.shop._id,
    })
      .sort({ createdAt: -1 })
      .populate("items.product", "name sellingPrice");

    const fixed = sales.map((s) => ({
      ...s.toObject(),
      amountReceived: s.amountReceived ?? s.grandTotal,
      pendingAmount: s.pendingAmount ?? 0,
    }));

    res.json(fixed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

/* ================= RECEIVE PAYMENT (SHOP SAFE) ================= */
export const receivePayment = async (req, res) => {
  try {
    const { phone } = req.params;
    let { amount } = req.body;

    amount = Number(amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const sales = await Sale.find({
      customerPhone: phone,
      shop: req.shop._id,
      pendingAmount: { $gt: 0 },
    }).sort({ createdAt: 1 }); // FIFO

    for (const sale of sales) {
      if (amount <= 0) break;

      const pay = Math.min(sale.pendingAmount, amount);

      sale.amountReceived += pay;
      sale.pendingAmount -= pay;
      sale.paymentStatus =
        sale.pendingAmount === 0 ? "PAID" : "PARTIAL";

      await sale.save();
      amount -= pay;
    }

    res.json({ message: "Payment recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
};
