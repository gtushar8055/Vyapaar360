import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/insights")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading Smart Insights...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A304B]">
            Smart Insights
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Instant intelligence derived from your live business data
          </p>
        </div>
        <img
          src="/Smart-insights.png"
          alt="Smart Insights Logo"
          className="size-20 object-contain animate-float ml-4"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* BUSINESS HEALTH */}
        <GradientCard
          title="Business Health Score"
          icon="🏪"
          gradient="from-[#1A304B] to-[#243f63]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{data.businessScore}/100</p>
              <p className="text-sm opacity-90 mt-1">
                Status: {data.cashHealth}
              </p>
            </div>
            <HealthRing score={data.businessScore} />
          </div>
        </GradientCard>

        {/* INVENTORY SNAPSHOT */}
        <InsightCard title="Inventory Snapshot" icon="📦">
          <StatRow label="Low Stock Items" value={data.lowStockCount} />
          <StatRow label="Dead Stock Items" value={data.deadStockCount} />
        </InsightCard>

        {/* CASH FLOW */}
        <InsightCard title="Cash Flow Status" icon="💰">
          <p
            className={`text-lg font-semibold ${
              data.cashHealth === "Healthy" ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.cashHealth}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Based on sales vs purchases
          </p>
        </InsightCard>

        {/* DEAD STOCK */}
        <InsightCard title="Dead Stock Items" icon="🧊">
          {data.deadStock.length ? (
            <ul className="space-y-1 text-sm">
              {data.deadStock.map((d) => (
                <li key={d} className="flex justify-between border-b py-1">
                  <span>{d}</span>
                  <span className="text-red-500 text-xs">No movement</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint text="No dead stock detected 🎉" />
          )}
        </InsightCard>

        {/* REORDER */}
        <InsightCard title="Smart Reorder Suggestions" icon="🛒">
          {data.reorderSuggestions.length ? (
            <ul className="space-y-2 text-sm">
              {data.reorderSuggestions.map((r) => (
                <li
                  key={r.product}
                  className="flex justify-between items-center bg-slate-50 rounded px-3 py-2"
                >
                  <span>{r.product}</span>
                  <span className="font-semibold text-[#1A304B]">+{r.qty}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint text="Stock levels are sufficient" />
          )}
        </InsightCard>

        <InsightCard title="Customer Payment Risk" icon="🧾">
          <ul className="text-sm space-y-2">
            <li className="flex justify-between">
              <span>Total pending amount</span>
              <span className="font-bold text-[#1A304B]">
                ₹{data.customerPaymentRisk.totalPendingAmount}
              </span>
            </li>

            <li className="flex justify-between">
              <span>Customers with dues</span>
              <span className="font-semibold text-orange-600">
                {data.customerPaymentRisk.customersWithDues}
              </span>
            </li>

            <li className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Risk level</span>
              <span
                className={`font-semibold ${
                  data.customerPaymentRisk.riskLevel === "High"
                    ? "text-red-600"
                    : data.customerPaymentRisk.riskLevel === "Medium"
                      ? "text-yellow-500"
                      : "text-green-600"
                }`}
              >
                {data.customerPaymentRisk.riskLevel}
              </span>
            </li>
          </ul>

          <p className="text-xs text-gray-500 mt-3">
            Insight: Follow up on pending payments to improve cash flow
          </p>
        </InsightCard>
      </div>

      <div className="mt-10 text-center text-sm text-black italic">
        <marquee behavior="fast" direction="right">
          More Insights will be available in future versions of Vyapaar360.
        </marquee>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function InsightCard({ title, icon, children }) {
  return (
    <div className="bg-white border-4 border-[#1A304B] rounded-xl shadow p-5 flex flex-col">
      <h2 className="text-lg font-semibold text-[#1A304B] mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function GradientCard({ title, icon, gradient, children }) {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} text-white rounded-xl shadow p-6`}
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm border-b py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function EmptyHint({ text }) {
  return <div className="text-sm text-gray-400 italic">{text}</div>;
}

/* ================= VISUAL INDICATOR ================= */

function HealthRing({ score }) {
  const color =
    score >= 75
      ? "stroke-green-400"
      : score >= 50
        ? "stroke-yellow-400"
        : "stroke-red-400";

  return (
    <svg width="70" height="70" viewBox="0 0 36 36">
      <path
        className="stroke-white/30"
        strokeWidth="3"
        fill="none"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className={color}
        strokeWidth="3"
        fill="none"
        strokeDasharray={`${score}, 100`}
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
    </svg>
  );
}
