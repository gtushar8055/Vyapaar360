import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

/* ================= CREATE PRODUCT ================= */
export const createProduct = async (req, res) => {
  try {
    const { name, hsnCode, category, gstRate, sellingPrice } = req.body;

    if (!name || !hsnCode || !category || gstRate === undefined || !sellingPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validGstSlabs = [0, 5, 12, 18, 28];
    if (!validGstSlabs.includes(gstRate)) {
      return res.status(400).json({ message: "Invalid GST slab" });
    }

    const product = await Product.create({
      name,
      hsnCode,
      category,
      gstRate,
      sellingPrice,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PRODUCTS ================= */
export const getProducts = async (req, res) => {
  try {
    if (!req.shop) {
      return res.status(400).json({ message: "Shop context missing" });
    }

    const { filter } = req.query;

    const inventory = await Inventory.find({ shop: req.shop._id })
      .populate("product");

    let products = inventory
      .filter(inv => inv.product && inv.product.isActive)
      .map(inv => {
        const stock = inv.currentStock;

        const status =
          stock <= 10 ? "LOW" :
          stock <= 30 ? "NORMAL" :
          "HIGH";

        return {
          _id: inv.product._id,
          name: inv.product.name,
          hsnCode: inv.product.hsnCode,
          gstRate: inv.product.gstRate,
          price: inv.product.sellingPrice,
          stock,
          status,
        };
      });

    if (filter === "low-stock") {
      products = products.filter(p => p.status === "LOW");
    }

    res.json(products);
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= UPDATE PRICE / GST ================= */
export const updateProductPricing = async (req, res) => {
  try {
    const { sellingPrice, gstRate } = req.body;

    if (sellingPrice === undefined || gstRate === undefined) {
      return res.status(400).json({ message: "Price and GST are required" });
    }

    if (sellingPrice <= 0) {
      return res.status(400).json({ message: "Invalid selling price" });
    }

    const validGstSlabs = [0, 5, 12, 18, 28];
    if (!validGstSlabs.includes(gstRate)) {
      return res.status(400).json({ message: "Invalid GST slab" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { sellingPrice, gstRate },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product pricing updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ARCHIVE PRODUCT ================= */
export const archiveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product archived successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
