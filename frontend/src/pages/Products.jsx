import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";

export default function Products() {
  const location = useLocation();
  const filter = new URLSearchParams(location.search).get("filter");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showInactive, setShowInactive] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [gstRate, setGstRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        filter ? `/products?filter=${filter}` : "/products",
      );
      setProducts(res.data);
    } catch (err) {
      console.error("Product fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setSellingPrice(product.price);
    setGstRate(product.gstRate);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setSellingPrice("");
    setGstRate("");
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await axios.patch(`/products/${editingProduct._id}`, {
        sellingPrice: Number(sellingPrice),
        gstRate: Number(gstRate),
      });
      closeEditModal();
      fetchProducts();
    } catch {
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading products...</div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hsnCode.toString().includes(searchTerm),
  );

  const activeProducts = filteredProducts.filter((p) => p.stock > 0);
  const inactiveProducts = filteredProducts.filter((p) => p.stock === 0);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}
      {/* <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A304B]">Products</h1>
          <p className="text-gray-500">Manage stock, pricing and GST</p>
        </div>

        <div className="mt-3">
          <input
            type="text"
            placeholder="Search by Product Name or HSN Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A304B]"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
          />
          Show Out of Stock Products
        </label>
      </div> */}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A304B]">Products</h1>
            <p className="text-gray-500">Manage stock, pricing and GST</p>
          </div>
          <img
            src="/Products.png"
            alt="Products Icon"
            className="size-28 object-contain animate-float"
          />
        </div>

        <div className="mt-3">
          <input
            type="text"
            placeholder="Search by Product Name or HSN Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A304B]"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
          />
          Show Out of Stock Products
        </label>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4">HSN</th>
              <th className="p-4">GST %</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Suggestion</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {activeProducts.map((p) => (
              <ProductRow key={p._id} p={p} onEdit={openEditModal} />
            ))}

            {showInactive &&
              inactiveProducts.map((p) => (
                <tr key={p._id} className="border-t bg-slate-50">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-center">{p.hsnCode}</td>
                  <td className="p-4 text-center">{p.gstRate}%</td>
                  <td className="p-4 text-center">₹{p.price}</td>
                  <td className="p-4 text-center">0</td>
                  <td className="p-4 text-center">
                    <StatusBadge status="NILL" /> {/* Changed  */}
                  </td>
                  <td className="p-4 text-center text-gray-500 text-sm">
                    Must Restock
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => openEditModal(p)}
                      className="text-[#1A304B] hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Edit Pricing</h2>

            <input
              type="number"
              className="w-full border p-2 rounded mb-3"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />

            <select
              className="w-full border p-2 rounded"
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
            >
              {[0, 5, 12, 18, 28].map((g) => (
                <option key={g} value={g}>
                  {g}%
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="bg-[#1A304B] text-white px-4 py-2 rounded"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function ProductRow({ p, onEdit }) {
  return (
    <tr className="border-t hover:bg-slate-50">
      <td className="p-4 font-medium">{p.name}</td>
      <td className="p-4 text-center">{p.hsnCode}</td>
      <td className="p-4 text-center">{p.gstRate}%</td>
      <td className="p-4 text-center">₹{p.price}</td>
      <td className="p-4 text-center">{p.stock}</td>
      <td className="p-4 text-center">
        <StatusBadge status={p.status} />
      </td>
      <td className="p-4 text-center">
        <ActionHint status={p.status} />
      </td>
      <td className="p-4 text-center">
        <button
          onClick={() => onEdit(p)}
          className="text-[#1A304B] hover:underline"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const styles = {
    LOW: "bg-red-100 text-red-700",
    NORMAL: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-green-100 text-green-700",
    NILL: "bg-gray-200 text-gray-600", 
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}

function ActionHint({ status }) {
  if (status === "LOW")
    return <span className="text-red-600">Restock soon</span>;
  if (status === "HIGH")
    return <span className="text-green-600">Focus on sales</span>;
  return <span className="text-yellow-600">Balanced stock</span>;
}
