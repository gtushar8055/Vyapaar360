import Purchase from "../models/Purchase.js";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

export const createPurchase = async (req, res) => {
  try {
    const { supplierName, invoiceNumber, items } = req.body;

    if (!supplierName || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid purchase data" });
    }

    let totalAmount = 0;
    let totalGst = 0;
    const purchaseItems = [];

    for (const item of items) {
      let product;

      //  NEW PRODUCT (find-or-create)
      if (item.newProduct) {
        product = await Product.findOne({
          name: item.newProduct.name.trim(),
        });

        if (!product) {
          product = await Product.create({
            name: item.newProduct.name.trim(),
            category: item.newProduct.category,
            hsnCode: item.newProduct.hsnCode,
            gstRate: item.newProduct.gstRate,
            sellingPrice: item.newProduct.sellingPrice,
            unit: item.newProduct.unit,
          });
        }
      }
      //  EXISTING PRODUCT
      else {
        product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
      }

      // INVENTORY UPSERT
const inventory = await Inventory.findOne({
  product: product._id,
  shop: req.shop._id,
});

if (inventory) {
  inventory.currentStock += item.quantity;

  if (item.newProduct?.sellingPrice) {
    inventory.sellingPrice = item.newProduct.sellingPrice;
  }

  inventory.lastUpdated = Date.now();
  await inventory.save();
} else {
  await Inventory.create({
    product: product._id,
    shop: req.shop._id,
    currentStock: item.quantity,
    sellingPrice:
      item.newProduct?.sellingPrice || product.sellingPrice || 0,
  });
}


      const itemAmount = item.quantity * item.purchasePrice;
      const itemGst = (itemAmount * item.gstRate) / 100;

      totalAmount += itemAmount;
      totalGst += itemGst;

      purchaseItems.push({
        product: product._id,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        gstRate: item.gstRate,
      });
    }

    const purchase = await Purchase.create({
      supplierName,
      invoiceNumber,
      items: purchaseItems,
      totalAmount,
      totalGst,
      shop: req.shop._id,
    });

    res.status(201).json({
      message: "Purchase saved successfully",
      purchase,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get all purchases
// @route   GET /api/purchases
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      shop: req.shop._id,
    }).populate("items.product");

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
