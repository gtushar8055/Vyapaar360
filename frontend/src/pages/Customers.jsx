import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [payment, setPayment] = useState(0);
  const [search, setSearch] = useState("");

  /* ===== CAPTCHA STATE ===== */
  const [captcha, setCaptcha] = useState({ a: 0, b: 0 });
  const [captchaInput, setCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ a, b });
    setCaptchaInput("");
  };

  const isCaptchaValid = Number(captchaInput) === captcha.a + captcha.b;

  const loadCustomers = async () => {
    const res = await axios.get("/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openHistory = async (customer) => {
    setSelected(customer);
    generateCaptcha(); 
    const res = await axios.get(`/customers/${customer.phone}/history`);
    setHistory(res.data);
  };

  const receivePayment = async () => {
    if (!payment || payment <= 0) return;
    if (!isCaptchaValid) return;

    await axios.post(`/customers/${selected.phone}/receive-payment`, {
      amount: Number(payment),
    });

    setPayment(0);
    generateCaptcha(); // refresh captcha after payment
    await openHistory(selected);
    await loadCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <input
        className="border p-2 rounded mb-4 w-full md:w-1/3"
        placeholder="Search by name or phone"
        onChange={(e) => setSearch(e.target.value)}
      /> */}

      <div className="flex justify-between items-start mb-4">
        <div className="w-full md:w-2/3">
          <h1 className="text-2xl font-bold mb-4">Customers</h1>
          <input
            className="border p-2 rounded mb-4 w-full"
            placeholder="Search by name or phone"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <img
          src="/Customers.png"
          alt="Customers Logo"
          className="size-28 object-contain animate-float ml-4"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Address</th>
              <th className="p-4">Visits</th>
              <th className="p-4">Total</th>
              <th className="p-4">Pending</th>
              <th className="p-4">Segment</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => {
              const visits = Number(c.totalVisits || 0);

              const segment =
                visits === 1
                  ? "NEW"
                  : visits <= 5
                    ? "REGULAR"
                    : visits <= 15
                      ? "LOYAL"
                      : "VIP";

              return (
                <tr key={c._id} className="border-t">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-center">{c.phone}</td>
                  <td className="p-4 text-center">{c.address}</td>
                  <td className="p-4 text-center">{visits}</td>

                  <td className="p-4 text-center">
                    ₹{Number(c.totalSpent || 0).toFixed(2)}
                  </td>

                  <td className="p-4 text-center text-red-600">
                    ₹{Number(c.totalPending || 0).toFixed(2)}
                  </td>

                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100">
                      {segment}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => openHistory(c)}
                      className="text-blue-600"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="font-bold mb-4">
              Billing History — {selected.name}
            </h2>

            <div className="max-h-64 overflow-auto space-y-3">
              {history.map((s) => (
                <div key={s._id} className="border rounded p-3">
                  <div className="flex justify-between font-medium">
                    <span>{new Date(s.saleDate).toDateString()}</span>
                    <span>₹{Number(s.grandTotal || 0).toFixed(2)}</span>
                  </div>

                  <div className="text-sm mt-1">
                    Received: ₹{Number(s.amountReceived || 0).toFixed(2)} |{" "}
                    <span className="text-red-600">
                      Pending: ₹{Number(s.pendingAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* ✅ PRODUCTS LIST */}
                  <div className="text-sm mt-2 text-gray-700">
                    {s.items?.map((item, idx) => (
                      <div key={idx} className="ml-2">
                        • {item.product?.name} × {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* RECEIVE PAYMENT */}
            <input
              type="number"
              className="border p-2 rounded w-full mt-4"
              placeholder="Receive amount"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            />

            {/* CAPTCHA */}
            <div className="mt-3">
              <label className="text-sm text-gray-600">
                Verify: {captcha.a} + {captcha.b}
              </label>
              <input
                type="number"
                className="border p-2 rounded w-full mt-1"
                placeholder="Enter captcha result"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
              />
            </div>

            <div className="text-right mt-4">
              <button
                onClick={receivePayment}
                disabled={!isCaptchaValid || payment <= 0}
                className={`px-4 py-2 rounded mr-2 text-white ${
                  isCaptchaValid
                    ? "bg-green-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Receive
              </button>
              <button
                onClick={() => setSelected(null)}
                className="border px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
