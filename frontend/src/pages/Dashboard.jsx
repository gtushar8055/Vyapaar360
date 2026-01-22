import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const roundValue = (value) =>
  Number.isFinite(value) ? Math.round(value * 100) / 100 : 0; // For rounding off


export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [monthlyView, setMonthlyView] = useState("sales");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/dashboard");
        setDashboard(res.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  const { kpis, charts } = dashboard || {};

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}
      {/* <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A304B]">
            Welcome, {user?.shopName}
          </h1>
          <p className="text-gray-500 mt-1">
            Here’s a complete overview of your business performance
          </p>
        </div>

        <div className="mt-4 sm:mt-0 text-sm text-gray-400">
          {new Date().toDateString()}
        </div>
      </div> */}

      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A304B]">
              Welcome, {user?.shopName}
            </h1>
            <p className="text-gray-500 mt-1">
              Here’s a complete overview of your business performance
            </p>
          </div>
          <img
            src="/business-idea.png"
            alt="Welcome"
            className="size-28 object-contain animate-float"
          />
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-400">
          {new Date().toDateString()}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <OverviewCard title="Today Sales" value={kpis?.todaySales} />
        <OverviewCard title="Monthly Sales" value={kpis?.monthlySales} />
        <OverviewCard
          title="Monthly Purchases"
          value={kpis?.monthlyPurchases}
        />
        <OverviewCard
          title="Low Stock Items"
          value={kpis?.lowStockCount}
          isCurrency={false}
        />
      </div>

      {/* STOCK ALERT */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-[#1A304B] to-[#243b55] text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Stock Alert</h3>
            <p className="text-sm text-slate-200 mt-1">
              {kpis.lowStockCount > 0
                ? "Some items are running low. Restock soon."
                : "All stocks are healthy."}
            </p>
          </div>

          {kpis.lowStockCount > 0 && (
            <button
              onClick={() => navigate("/products?filter=low-stock")}
              className="bg-white text-[#1A304B] font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              View Items
            </button>
          )}
        </div>
      </div>

      {/* QUICK INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <InsightCard
          title="Sales Health"
          text={
            kpis?.monthlySales > kpis?.monthlyPurchases
              ? "Your sales are healthy compared to purchases."
              : "Purchases are higher than sales. Review inventory flow."
          }
        />

        <InsightCard
          title="GST Status"
          text={`GST Input: ₹${kpis?.gstInput ?? 0} | GST Output: ₹${
            kpis?.gstOutput ?? 0
          }`}
        />
      </div>

      {/* DAILY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Sales Trend">
          {charts?.salesTrend?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis tickFormatter={(v) => roundValue(v)}/>  
                <Tooltip formatter={(v) => `₹ ${roundValue(v)}`}/>
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#1A304B"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="Purchase Trend">
          {charts?.purchaseTrend?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.purchaseTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis tickFormatter={(v) => roundValue(v)}/> 
                <Tooltip formatter={(v) => `₹ ${roundValue(v)}`}/>
                <Bar dataKey="purchases" fill="#64748b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      {/* GST + MONTHLY COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="GST Summary">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: "GST Input", value: kpis?.gstInput ?? 0 },
                { name: "GST Output", value: kpis?.gstOutput ?? 0 },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => roundValue(v)}/>
              <Tooltip formatter={(v) => `₹ ${roundValue(v)}`}/>
              <Bar dataKey="value" fill="#1A304B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* MONTHLY TOGGLE CARD */}
        <ChartCard
          title={
            monthlyView === "sales"
              ? "Monthly Sales Comparison"
              : "Monthly Purchase Comparison"
          }
        >
          <div className="flex justify-end mb-3">
            <button
              onClick={() =>
                setMonthlyView(monthlyView === "sales" ? "purchases" : "sales")
              }
              className="text-sm px-3 py-1 border rounded text-[#1A304B] hover:bg-slate-50"
            >
              {monthlyView === "sales" ? "View Purchases" : "View Sales"}
            </button>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={
                monthlyView === "sales"
                  ? getMonthlyData(charts.salesTrend, "sales")
                  : getMonthlyData(charts.purchaseTrend, "purchases")
              }
            >
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => roundValue(v)}/>
              <Tooltip formatter={(v) => `₹ ${roundValue(v)}`}/>
              <Bar dataKey="total" fill="#1A304B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getMonthlyData(data = [], key) {
  const map = {};

  data.forEach((d) => {
    const month = d._id.slice(0, 7); // YYYY-MM
    map[month] = (map[month] || 0) + d[key];
  });

  return Object.entries(map).map(([month, total]) => ({
    month,
    total,
  }));
}

// function OverviewCard({ title, value, isCurrency = true }) {
//   return (
//     <div className="border-l-8 border-[#1A304B] bg-white rounded-xl shadow p-6">
//       <p className="text-gray-500 text-sm">{title}</p>
//       <h2 className="text-2xl font-bold text-[#1A304B] mt-2">
//         {isCurrency ? `₹ ${value ?? 0}` : (value ?? 0)}
//       </h2>
//     </div>
//   );
// }

function OverviewCard({ title, value, isCurrency = true }) {
  const formattedValue = isCurrency
    ? Number(value ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : value ?? 0;

  return (
    <div className="border-l-8 border-[#1A304B] bg-white rounded-xl shadow p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-[#1A304B] mt-2">
        {isCurrency ? `₹ ${formattedValue}` : formattedValue}
      </h2>
    </div>
  );
}


function ChartCard({ title, children }) {
  return (
    <div className="border-4 border-[#1A304B] bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-[#1A304B] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InsightCard({ title, text }) {
  return (
    <div className="bg-gradient-to-r from-[#1A304B] to-[#243f63] text-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{text}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[300px] flex items-center justify-center text-gray-400">
      No data available yet
    </div>
  );
}
