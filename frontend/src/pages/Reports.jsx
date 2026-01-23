import axios from "../api/axios";

export default function Reports() {
  const download = async (url, filename) => {
    try {
      const res = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (err) {
      alert("Report generation failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start p-6">
      <div className="w-full max-w-3xl">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1A304B]">
            Business Reports
          </h1>
          <p className="text-gray-500 mt-2">
            Download professionally generated business reports (PDF)
          </p>

          <img
          src="/report.png"
          alt="Smart Insights Logo"
          className="size-20 object-contain animate-float mx-auto mt-5"
        />
        </div>

        {/* SINGLE CENTRAL BOX */}
        <div className="bg-white border-4 border-[#1A304B] rounded-xl shadow p-6 space-y-6">
          <ReportRow
            title="Today's Business Report"
            desc="Sales, purchases, bills & cash flow for today"
            onClick={() =>
              download("/reports/today", "today-business-report.pdf")
            }
          />

          <Divider />

          <ReportRow
            title="Monthly Business Report"
            desc="Complete monthly summary including inventory & performance"
            onClick={() =>
              download("/reports/monthly", "monthly-business-report.pdf")
            }
          />

          <Divider />

          <ReportRow
            title="Sales Summary Report"
            desc="High-level sales performance and billing summary"
            onClick={() =>
              download("/reports/sales-summary", "sales-summary-report.pdf")
            }
          />
        </div>

        <div className="mt-10 text-center text-sm text-black italic">
          <marquee behavior="normal" direction="left">
            More advanced reports will be available in future versions of
            Vyapaar360.
          </marquee>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function ReportRow({ title, desc, onClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-lg font-semibold text-[#1A304B]">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 rounded-lg bg-[#1A304B] text-white hover:bg-[#243f63] transition flex items-center justify-center"
        title="Download PDF"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
      </button>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-200" />;
}
