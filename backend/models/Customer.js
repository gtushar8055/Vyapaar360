import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    /* MULTI-SHOP ISOLATION */
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    phone: {
      type: String,
      required: true,
    },

    address: String,
    gstOrAadhaar: String,

    totalVisits: { type: Number, default: 0 },

    totalSpent: { type: Number, default: 0 }, // total billed
    totalReceived: { type: Number, default: 0 },
    totalPending: { type: Number, default: 0 },

    firstPurchaseAt: Date,
    lastPurchaseAt: Date,
    lastPaymentAt: Date,
  },
  { timestamps: true }
);

/* UNIQUE PER SHOP  */
customerSchema.index({ shop: 1, phone: 1 }, { unique: true });

export default mongoose.model("Customer", customerSchema);
