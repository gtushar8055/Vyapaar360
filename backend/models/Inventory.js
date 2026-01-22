import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },

    //  SINGLE SOURCE OF SELLING PRICE
    sellingPrice: {
  type: Number,
  default: 0,   
},


    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ shop: 1, product: 1 }, { unique: true });

export default mongoose.model("Inventory", inventorySchema);
