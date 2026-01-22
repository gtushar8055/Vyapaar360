import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true },
  gstRate: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    customerAddress: { type: String },
    customerGstOrAadhaar: { type: String },

    items: [saleItemSchema],

    subtotal: { type: Number, required: true },
    totalGst: { type: Number, required: true },
    grandTotal: { type: Number, required: true },

    /* ===== PAYMENT TRACKING ===== */
    amountReceived: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PARTIAL", "PENDING"],
      default: "PENDING",
    },

    reminderSent: { type: Boolean, default: false },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
