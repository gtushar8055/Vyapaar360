import PDFDocument from "pdfkit";
import Sale from "../models/Sale.js";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

/* ================= CREATE SALE ================= */
export const createSale = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerGstOrAadhaar,
      items,
      amountReceived = 0,
    } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid sale data" });
    }

    let subtotal = 0;
    let totalGst = 0;
    const saleItems = [];

    /* ================= ITEMS LOOP ================= */
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const inventory = await Inventory.findOne({
        product: product._id,
        shop: req.shop._id,
      });

      if (!inventory || inventory.currentStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      inventory.currentStock -= item.quantity;
      await inventory.save();

      const sellingPrice =
        product.sellingPrice ?? product.price ?? 0;

      if (!sellingPrice) {
        return res.status(400).json({
          message: `Selling price missing for ${product.name}`,
        });
      }

      const amount = item.quantity * sellingPrice;
      const gst = (amount * product.gstRate) / 100;

      subtotal += amount;
      totalGst += gst;

      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        sellingPrice,
        gstRate: product.gstRate,
      });
    }

    const grandTotal = subtotal + totalGst;
    const received = Number(amountReceived) || 0;
    const pending = grandTotal - received;

    /* ================= CREATE SALE ================= */
    const sale = await Sale.create({
      customerName,
      customerPhone,
      customerAddress,
      customerGstOrAadhaar,
      items: saleItems,
      subtotal,
      totalGst,
      grandTotal,
      amountReceived: received,
      pendingAmount: pending,
      paymentStatus:
        pending === 0 ? "PAID" : received > 0 ? "PARTIAL" : "PENDING",
      shop: req.shop._id,
    });

    /* ================= CUSTOMER (SHOP SAFE) ================= */
    let customer = await Customer.findOne({
      phone: customerPhone,
      shop: req.shop._id,
    });

    if (!customer) {
      await Customer.create({
        shop: req.shop._id,               
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        gstOrAadhaar: customerGstOrAadhaar,
        totalVisits: 1,
        totalSpent: grandTotal,
        totalReceived: received,
        totalPending: pending,
        firstPurchaseAt: new Date(),
        lastPurchaseAt: new Date(),
        lastPaymentAt: received > 0 ? new Date() : null,
      });
    } else {
      customer.shop = req.shop._id;

      customer.totalVisits += 1;
      customer.totalSpent += grandTotal;
      customer.totalReceived += received;
      customer.totalPending += pending;
      customer.lastPurchaseAt = new Date();
      if (received > 0) customer.lastPaymentAt = new Date();

      await customer.save();
    }

    res.status(201).json({ saleId: sale._id });
  } catch (err) {
    console.error("Sale error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET SALES ================= */
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ shop: req.shop._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name hsnCode");

    res.json(sales);
  } catch (err) {
    console.error("Get sales error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GENERATE INVOICE ================= */
export const generateInvoice = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.saleId).populate(
      "items.product"
    );

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const shop = req.shop;
    const isPreview = req.query.preview === "true";

    const doc = new PDFDocument({ size: "A4", margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${isPreview ? "inline" : "attachment"}; filename=invoice-${sale._id}.pdf`
    );

    doc.pipe(res);

    /* ================= PAGE CONSTANTS ================= */
    const tableTop = 270;
    const rowHeight = 22;
    const maxRows = 10;
    const tableEndY = 640;

    /* ================= HEADER ================= */
    doc.font("Helvetica-Bold").fontSize(14).text("TAX INVOICE", {
      align: "center",
    });

    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Generating Partner : Vyapaar360", { align: "center" });

    /* ================= SHOP BOX ================= */
    doc.rect(30, 70, 535, 70).stroke();
    doc.font("Helvetica-Bold").fontSize(11).text(shop.shopName, 35, 75);
    doc.font("Helvetica").fontSize(9);
    doc.text(`Address: ${shop.shopAddress}`, 35, 92);
    doc.text(`GSTIN: ${shop.gstNumber}`, 35, 107);
    doc.text(`Invoice Date: ${sale.saleDate.toDateString()}`, 380, 75);
    doc.text(`Invoice No: ${sale._id.toString().slice(-6)}`, 380, 92);

    /* ================= CUSTOMER BOX ================= */
    doc.rect(30, 150, 535, 90).stroke();
    doc.font("Helvetica-Bold").text("Billing Details", 35, 155);
    doc.font("Helvetica").fontSize(9);
    doc.text(`Name: ${sale.customerName}`, 35, 172);
    doc.text(`Address: ${sale.customerAddress || "-"}`, 35, 187);
    doc.text(`Phone: ${sale.customerPhone || "-"}`, 35, 202);
    doc.text(
      `GST/Aadhaar: ${sale.customerGstOrAadhaar || "N/A"}`,
      35,
      217
    );

    /* ================= TABLE HEADER ================= */
    const colX = [30, 60, 220, 280, 330, 390, 450, 510];
    const headers = [
      "Sr",
      "Item",
      "HSN",
      "Qty",
      "Rate",
      "GST %",
      "GST Amt",
      "Amount",
    ];

    doc.rect(30, tableTop, 535, rowHeight).fill("#eeeeee");
    doc.fillColor("black");
    doc.font("Helvetica-Bold").fontSize(9);

    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 5, tableTop + 7);
    });

    colX.forEach((x) => {
      doc.moveTo(x, tableTop).lineTo(x, tableEndY).stroke();
    });
    doc.moveTo(565, tableTop).lineTo(565, tableEndY).stroke();

    /* ================= TABLE BODY ================= */
    let y = tableTop + rowHeight;
    let subtotal = 0;
    let totalGst = 0;

    doc.font("Helvetica").fontSize(9);

    for (let i = 0; i < maxRows; i++) {
      if (sale.items[i]) {
        const item = sale.items[i];
        const amount = item.quantity * item.sellingPrice;
        const gst = (amount * item.gstRate) / 100;

        subtotal += amount;
        totalGst += gst;

        const row = [
          i + 1,
          item.product.name,
          item.product.hsnCode || "-",
          item.quantity,
          item.sellingPrice.toFixed(2),
          `${item.gstRate}%`,
          gst.toFixed(2),
          (amount + gst).toFixed(2),
        ];

        row.forEach((cell, c) => {
          doc.text(String(cell), colX[c] + 5, y + 7);
        });
      }
      y += rowHeight;
    }

    /* ================= TOTALS ================= */
    const totalsY = tableEndY + 10;
    doc.font("Helvetica-Bold");
    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)} /-`, 450, totalsY);
    doc.text(`Total GST: Rs. ${totalGst.toFixed(2)} /-`, 450, totalsY + 14);
    doc.text(
      `Grand Total: Rs. ${(subtotal + totalGst).toFixed(2)} /-`,
      450,
      totalsY + 28
    );

    /* ================= FOOTER ================= */
    const bottomY = 700;

    doc.rect(30, bottomY, 260, 70).stroke();
    doc.font("Helvetica-Bold").fontSize(9).text(
      "Terms & Conditions",
      35,
      bottomY + 5
    );
    doc.font("Helvetica").fontSize(8).text(
      "1. Goods once sold will not be taken back.\n2. Payment due upon receipt.",
      35,
      bottomY + 20,
      { width: 240 }
    );

    doc.rect(300, bottomY, 265, 70).stroke();
    doc.font("Helvetica-Bold").fontSize(9).text(
      "Bank Details",
      305,
      bottomY + 5
    );
    doc.font("Helvetica").fontSize(8).text(
      `Bank: ${shop.bankName}\nA/C: ${shop.bankAccountNumber}\nIFSC: ${shop.bankIFSC}`,
      305,
      bottomY + 20,
      { width: 245 }
    );

    doc
      .font("Helvetica")
      .fontSize(8)
      .text("Thank you for choosing Vyapaar360", 5, 800, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ message: "Invoice generation failed" });
  }
};
