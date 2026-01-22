import PDFDocument from "pdfkit";
import Sale from "../models/Sale.js";

export const generateInvoice = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.saleId).populate("items.product");
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const shop = req.shop;

    const doc = new PDFDocument({ size: "A4", margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${sale._id}.pdf`
    );
    doc.pipe(res);

    /* ================= PAGE CONSTANTS ================= */
    const pageWidth = 595;
    const tableTop = 270;
    const rowHeight = 22;
    const maxRows = 10;               // fixed rows to keep one page
    const tableEndY = 640; // + header

    /* ================= HEADER ================= */
    doc.font("Helvetica-Bold").fontSize(14).text("TAX INVOICE", {
      align: "center",
    });

    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(9).text(
      "Generating Partner : Vyapaar360",
      { align: "center" }
    );

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
    doc.text(`Address: ${sale.customerAddress}`, 35, 187);
    doc.text(`Phone: ${sale.customerPhone}`, 35, 202);
    doc.text(
      `GST/Aadhaar: ${sale.customerGstOrAadhaar || "N/A"}`,
      35,
      217
    );

    /* ================= TABLE SETUP ================= */
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

    // Header background
    doc.rect(30, tableTop, 535, rowHeight).fill("#eeeeee");
    doc.fillColor("black");

    doc.font("Helvetica-Bold").fontSize(9);
    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 5, tableTop + 7);
    });

    /* ================= VERTICAL LINES (FULL HEIGHT) ================= */
    colX.forEach((x) => {
      doc.moveTo(x, tableTop).lineTo(x, tableEndY).stroke();
    });
    doc.moveTo(565, tableTop).lineTo(565, tableEndY).stroke();

    /* ================= TABLE BODY ================= */
    let y = tableTop + rowHeight;
    let subtotal = 0;
    let totalGst = 0;

    doc.font("Helvetica").fontSize(9).fillColor("black");

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
          item.product.hsnCode,
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

    /* ================= TOTALS (BOTTOM OF TABLE) ================= */
    const totalsY = tableEndY + 8;
    const totalsX = 450;

    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)} /-`, totalsX, totalsY);
    doc.text(`Total GST: Rs. ${totalGst.toFixed(2)} /-`, totalsX, totalsY + 14);
    doc.text(
      `Grand Total: Rs. ${(subtotal + totalGst).toFixed(2)} /-`,
      totalsX,
      totalsY + 28
    );

    /* ================= BOTTOM BOXES ================= */
    const bottomY = 700;

    // Terms & Conditions
    doc.rect(30, bottomY, 260, 70).stroke();
    doc.font("Helvetica-Bold").fontSize(9).text("Terms & Conditions", 35, bottomY + 5);
    doc.font("Helvetica").fontSize(8).text(
      "1. Goods once sold will not be taken back.\n2. Payment due upon receipt.",
      35,
      bottomY + 20,
      { width: 240 }
    );

    // Bank Details
    doc.rect(300, bottomY, 265, 70).stroke();
    doc.font("Helvetica-Bold").fontSize(9).text("Bank Details", 305, bottomY + 5);
    doc.font("Helvetica").fontSize(8).text(
      `Bank: ${shop.bankName}\nA/C: ${shop.bankAccountNumber}\nIFSC: ${shop.bankIFSC}`,
      305,
      bottomY + 20,
      { width: 245 }
    );

    /* ================= FOOTER ================= */
    doc.font("Helvetica").fontSize(8).text(
      "Thank you for choosing Vyapaar360",
      5,
      800,
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
