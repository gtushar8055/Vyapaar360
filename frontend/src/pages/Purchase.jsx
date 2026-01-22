import { useEffect, useState } from "react";
import axios from "../api/axios";
import Swal from "sweetalert2";

export default function Purchase() {
  const emptyItem = {
    productId: "",
    quantity: 1,
    purchasePrice: "",
    gstRate: "",
    newProduct: null,
  };

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([emptyItem]);
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= PURCHASE HISTORY ================= */
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    axios.get("/products").then((res) => setProducts(res.data));
  }, []);

  /* ================= FETCH PURCHASE HISTORY ================= */
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get("/purchases");

      const sortedHistory = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setHistory(sortedHistory);
      setShowHistory(true);
    } catch {
      Swal.fire("Error", "Failed to load purchase history", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ================= ITEM HELPERS ================= */
  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index, updates) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!supplierName || !invoiceNumber) {
      Swal.fire("Missing details", "Supplier & Invoice required", "warning");
      return;
    }

    try {
      setSaving(true);
      await axios.post("/purchases", {
        supplierName,
        invoiceNumber,
        items,
      });

      Swal.fire("Success", "Purchase saved successfully", "success");
      setItems([emptyItem]);
      setSupplierName("");
      setInvoiceNumber("");
    } catch {
      Swal.fire("Error", "Failed to save purchase", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        {/* <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1A304B]">
              Upload your Purchase / Bill
            </h1>
            <p className="text-gray-500">
              Upload bills received from suppliers or wholesalers
            </p>
          </div>

          <button
            onClick={loadHistory}
            className="bg-white border border-[#1A304B] text-[#1A304B] px-4 py-2 rounded hover:bg-slate-50"
          >
            View Purchase History
          </button>
        </div> */}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A304B]">
                Upload your Purchase / Bill
              </h1>
              <p className="text-gray-500">
                Upload bills received from suppliers or wholesalers
              </p>
            </div>
            <img
              src="/purchase.png"
              alt="Purchase Logo"
              className="size-16 object-contain animate-float"
            />
          </div>
          <button
            onClick={loadHistory}
            className="bg-white border border-[#1A304B] text-[#1A304B] px-4 py-2 rounded hover:bg-slate-50"
          >
            View Purchase History
          </button>
        </div>

        {/* SUPPLIER & INVOICE */}
        <div className="bg-white rounded-xl shadow border-2 border-[#1A304B] p-6 space-y-4">
          <h3 className="font-semibold text-[#1A304B] mb-4">
            Supplier Details
          </h3>
          <input
            className="border p-3 rounded w-full"
            placeholder="Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
          <input
            className="border p-3 rounded w-full"
            placeholder="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        {/* ITEMS */}
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow border-2 border-[#1A304B] p-6 relative"
          >
            {items.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="absolute top-4 right-4 text-red-500 text-sm"
              >
                Remove
              </button>
            )}

            <h3 className="font-semibold text-[#1A304B] mb-4">
              Item {index + 1}
            </h3>

            {!item.newProduct ? (
              <>
                <select
                  className="border p-3 rounded w-full mb-2"
                  value={item.productId}
                  onChange={(e) =>
                    updateItem(index, { productId: e.target.value })
                  }
                >
                  <option value="">Select existing product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (HSN {p.hsnCode})
                    </option>
                  ))}
                </select>

                <button
                  className="text-blue-600 text-sm"
                  onClick={() =>
                    updateItem(index, {
                      productId: "",
                      newProduct: {
                        name: "",
                        category: "",
                        hsnCode: "",
                        gstRate: "",
                        sellingPrice: "",
                      },
                    })
                  }
                >
                  + Add New Product
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-blue-600 text-sm mb-3"
                  onClick={() => updateItem(index, { newProduct: null })}
                >
                  ← Select Existing Product
                </button>

                <div className="grid md:grid-cols-2 gap-3">
                  {["name", "category", "hsnCode"].map((field) => (
                    <input
                      key={field}
                      className="border p-3 rounded"
                      placeholder={field.toUpperCase()}
                      onChange={(e) =>
                        updateItem(index, {
                          newProduct: {
                            ...item.newProduct,
                            [field]: e.target.value,
                          },
                        })
                      }
                    />
                  ))}
                  <input
                    type="number"
                    placeholder="GST %"
                    className="border p-3 rounded"
                    onChange={(e) =>
                      updateItem(index, {
                        newProduct: {
                          ...item.newProduct,
                          gstRate: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Selling Price"
                    className="border p-3 rounded"
                    onChange={(e) =>
                      updateItem(index, {
                        newProduct: {
                          ...item.newProduct,
                          sellingPrice: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </>
            )}

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <input
                type="number"
                placeholder="Quantity"
                className="border p-3 rounded"
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) })
                }
              />
              <input
                type="number"
                placeholder="Purchase Price"
                className="border p-3 rounded"
                onChange={(e) =>
                  updateItem(index, { purchasePrice: Number(e.target.value) })
                }
              />
              <input
                type="number"
                placeholder="GST %"
                className="border p-3 rounded"
                onChange={(e) =>
                  updateItem(index, { gstRate: Number(e.target.value) })
                }
              />
            </div>
          </div>
        ))}

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button
            onClick={addItem}
            className="bg-[#1A304B] text-white px-4 py-2 rounded"
          >
            + Add Item
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            {saving ? "Uploading..." : "Upload Purchase"}
          </button>
        </div>
      </div>

      {/* ================= PURCHASE HISTORY MODAL ================= */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A304B]">
                Purchase History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-red-500"
              >
                Close
              </button>
            </div>

            {loadingHistory ? (
              <p>Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-gray-500">No purchases yet.</p>
            ) : (
              history.map((p) => (
                <div key={p._id} className="border rounded-lg p-4 mb-4">
                  <p className="font-semibold">
                    {p.supplierName} • Invoice {p.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left">Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>GST %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.product?.name}</td>
                          <td className="text-center">{i.quantity}</td>
                          <td className="text-center">₹{i.purchasePrice}</td>
                          <td className="text-center">{i.gstRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
