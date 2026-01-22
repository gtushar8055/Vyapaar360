import { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    gstOrAadhaar: "",
  });

  const [amountReceived, setAmountReceived] = useState("");
  const [saving, setSaving] = useState(false);

  /* ===== SALES HISTORY ===== */
  const [showHistory, setShowHistory] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    axios.get("/products").then((res) => setProducts(res.data));
  }, []);

  /* ================= ITEM HELPERS ================= */
  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, key, value) => {
    const copy = [...items];
    copy[index][key] = value;
    setItems(copy);
  };

  /* ================= CALCULATIONS ================= */
  const { subtotal, totalGst, grandTotal, pending } = useMemo(() => {
    let sub = 0;
    let gst = 0;

    items.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);
      if (!product) return;

      const qty = Number(item.quantity);
      const price = Number(product.price ?? product.sellingPrice);
      const rate = Number(product.gstRate);

      const amount = qty * price;
      const gstAmt = (amount * rate) / 100;

      sub += amount;
      gst += gstAmt;
    });

    const received = Number(amountReceived) || 0;
    const grand = sub + gst;

    return {
      subtotal: sub,
      totalGst: gst,
      grandTotal: grand,
      pending: Math.max(grand - received, 0),
    };
  }, [items, products, amountReceived]);

  /* ================= SAVE SALE ================= */
  const saveSale = async () => {
    if (!customer.name || items.length === 0) {
      return Swal.fire("Missing data", "Customer & items required", "warning");
    }

    try {
      setSaving(true);

      await axios.post("/sales", {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerGstOrAadhaar: customer.gstOrAadhaar,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
        amountReceived: Number(amountReceived) || 0,
      });

      Swal.fire("Success", "Sale saved successfully", "success");

      setItems([{ productId: "", quantity: 1 }]);
      setAmountReceived("");
      setCustomer({ name: "", phone: "", address: "", gstOrAadhaar: "" });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Server error",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= SALES HISTORY ================= */
  const openSalesHistory = async () => {
    const res = await axios.get("/sales");
    setSalesHistory(res.data);
    setShowHistory(true);
  };

  const previewInvoice = async (saleId) => {
    const res = await axios.get(`/sales/${saleId}/invoice?preview=true`, {
      responseType: "blob",
    });

    const file = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(file);
    window.open(url);
  };

  const downloadInvoice = async (saleId) => {
    const res = await axios.get(`/sales/${saleId}/invoice`, {
      responseType: "blob",
    });

    const file = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(file);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${saleId}.pdf`;
    a.click();
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Start Billing</h1>
        <button
          onClick={openSalesHistory}
          className="border border-[#1A304B] px-4 py-2 rounded bg-slate-50"
        >
          View Sales History
        </button>
      </div> */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Start Billing</h1>
          <img
            src="/Billing.png"
            alt="Billing Logo"
            className="size-14 object-contain animate-float"
          />
        </div>
        <button
          onClick={openSalesHistory}
          className="border border-[#1A304B] px-4 py-2 rounded bg-slate-50"
        >
          View Sales History
        </button>
      </div>

      {/* CUSTOMER */}
      <div className="bg-white rounded-xl border-2 border-[#1A304B] shadow p-5 mb-6">
        <h2 className="font-semibold mb-3">Customer Details</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            placeholder="Customer Name *"
            className="border p-2 rounded"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            placeholder="Phone"
            className="border p-2 rounded"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
          />
          <input
            placeholder="Address"
            className="border p-2 rounded"
            value={customer.address}
            onChange={(e) =>
              setCustomer({ ...customer, address: e.target.value })
            }
          />
          <input
            placeholder="GST / Aadhaar"
            className="border p-2 rounded"
            value={customer.gstOrAadhaar}
            onChange={(e) =>
              setCustomer({ ...customer, gstOrAadhaar: e.target.value })
            }
          />
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-xl border-2 border-[#1A304B] shadow p-5 mb-6">
        <h2 className="font-semibold mb-3">Items</h2>

        {items.map((item, index) => (
          <div key={index} className="grid md:grid-cols-3 gap-4 mb-3">
            <select
              className="border p-2 rounded"
              value={item.productId}
              onChange={(e) => updateItem(index, "productId", e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} 
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              className="border p-2 rounded"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
            />

            <button
              onClick={() => removeItem(index)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button onClick={addItem} className="text-blue-600 text-sm">
          + Add Item
        </button>
      </div>

      {/* TOTALS */}
      <div className="bg-white rounded-xl border-2 border-[#1A304B] shadow p-5 mb-6">
        <h2 className="font-semibold mb-3">Total Amounts</h2>
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>GST: ₹{totalGst.toFixed(2)}</p>
        <p className="font-semibold">Grand Total: ₹{grandTotal.toFixed(2)}</p>

        <input
          type="number"
          placeholder="Amount Received"
          className="border p-2 rounded mt-2"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e.target.value)}
        />

        <p className="text-red-600 mt-1">Pending: ₹{pending.toFixed(2)}</p>
      </div>

      <button
        onClick={saveSale}
        disabled={saving}
        className="bg-[#1A304B] text-white px-6 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Sale"}
      </button>

      {/* ================= SALES HISTORY MODAL ================= */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Sales History</h2>
              <button onClick={() => setShowHistory(false)}>Close</button>
            </div>

            {salesHistory.map((s) => (
              <div key={s._id} className="border rounded-lg p-4 mb-4 space-y-2">
                <div className="text-sm font-medium">
                  {s.customerName} ({s.customerPhone})
                </div>
                <div className="text-xs text-gray-500">{s.customerAddress}</div>

                <div className="flex justify-between font-medium">
                  <span>{new Date(s.createdAt).toLocaleString()}</span>
                  <span>₹{s.grandTotal}</span>
                </div>

                <div className="text-sm">
                  Received: ₹{s.amountReceived} | Pending: ₹{s.pendingAmount}
                </div>

                {s.items.map((i, idx) => (
                  <div key={idx} className="text-sm ml-2">
                    • {i.product?.name} × {i.quantity}
                  </div>
                ))}

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => previewInvoice(s._id)}
                    className="text-blue-600 text-sm"
                  >
                    Preview Invoice
                  </button>
                  <button
                    onClick={() => downloadInvoice(s._id)}
                    className="text-green-600 text-sm"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
