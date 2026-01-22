import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import gstRoutes from "./routes/gstRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import customerRoutes from "./routes/customerRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";











const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/gst", gstRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/reports", reportsRoutes);









app.get("/", (req, res) => {
  res.send("Vyapaar360 Backend is running");
});

export default app;
