import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* NAVBAR (Landing only) */}
      <div className="flex justify-between items-center px-10 py-6 bg-white border-b border-gray-200">
        <img src="/logo.png" alt="Vyapaar360" className="h-10" />

        <div className="flex gap-10 text-[#1A304B] font-semibold">
          <span onClick={() => navigate("/login")} className="cursor-pointer">
            Features
          </span>
          <span onClick={() => navigate("/login")} className="cursor-pointer">
            About
          </span>
          <span onClick={() => navigate("/login")} className="cursor-pointer">
            Contact
          </span>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="bg-[#1A304B] text-white px-6 py-2 rounded-md"
        >
          Login
        </button>
      </div>

      {/* HERO */}
      <section className="bg-[#F7F9FC] py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          {/* Card Wrapper */}
          <div className="bg-white border-2 border-[#1A304B] rounded-2xl p-16 grid md:grid-cols-2 items-center gap-16 relative overflow-hidden shadow-sm">
            <div>
              <h1 className="text-5xl font-bold text-[#1A304B] leading-tight mb-6">
                A 360 Degree Solution for Modern Indian Businesses
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                Billing, Inventory, Purchase, GST, Reports and Insights —
                everything your shop needs to run smoothly and digitally.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="bg-[#1A304B] text-white px-8 py-4 rounded-lg text-lg"
              >
                Get Started
              </button>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute w-[420px] h-[420px] bg-[#1A304B] rounded-full opacity-15"></div>
              <img
                src="/shop.png"
                alt="Indian Shop"
                className="relative z-10 w-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ZIG ZAG SECTIONS */}
      <Feature
        img="/screens/dashboard.png"
        title="Complete Business Dashboard"
        text="Track today’s sales, monthly performance, purchases and stock in one place."
        bullets={["Today & Monthly Sales", "GST Overview", "Stock Alerts"]}
      />

      <Feature
        img="/screens/sales.png"
        title="GST Ready Billing & Sales"
        text="Create invoices and manage customers with automatic GST calculations."
        reverse
        blue
        bullets={[
          "Invoice Generator",
          "Customer Management",
          "GST Auto Calculation",
        ]}
      />

      <Feature
        img="/screens/purchase.png"
        title="Smart Purchase & Supplier Management"
        text="Manage purchases, suppliers and stock entry with complete accuracy and history tracking."
        bullets={[
          "Add Purchases with GST",
          "Supplier Management",
          "Automatic Stock Update",
          "Purchase History Tracking",
        ]}
      />

      <Feature
        img="/screens/inventory.png"
        title="Inventory & Low Stock Alerts"
        text="Never run out of stock. Smart alerts for every product."
        reverse
        blue
        bullets={[
          "Live Stock Count",
          "Low Stock Alerts",
          "Dead Stock Detection",
        ]}
      />

      <Feature
        img="/screens/insights.png"
        title="Smart Insights & Reports"
        text="Understand business health with AI-like smart insights."
        bullets={["Business Score", "Cash Health", "Reorder Suggestions"]}
      />

      <section className="bg-[#1A304B] py-24 relative overflow-hidden">
        <div className="absolute left-10 top-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        <div className="absolute right-10 bottom-10 w-96 h-96 bg-white opacity-5 rounded-full"></div>

        <div className="max-w-6xl mx-auto px-8 text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Many More Powerful Features <br /> Are Waiting For You
          </h2>

          <p className="text-lg md:text-xl opacity-80 mb-10 max-w-3xl mx-auto">
            Experience smart billing, inventory control, purchase tracking, GST
            reports, insights, and complete business management — all in one
            place designed specially for Indian retail shops.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-white text-[#1A304B] px-10 py-4 rounded-lg text-lg font-semibold hover:scale-105 transition"
          >
            Explore Vyapaar360 Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ================= FEATURE ================= */

function Feature({ img, title, text, bullets, reverse, blue }) {
  return (
    <section
      className={`${blue ? "bg-[#1A304B]" : "bg-white"} py-28 relative overflow-hidden`}
    >
      <div
        className={`absolute ${reverse ? "left-0" : "right-0"} top-10 w-72 h-72 rounded-full opacity-10 ${blue ? "bg-white" : "bg-[#1A304B]"}`}
      ></div>

      <div
        className={`max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center`}
      >
        <div className={`${reverse ? "md:order-2" : ""}`}>
          <img
            src={img}
            alt="feature"
            className={`rounded-xl shadow-xl transition duration-500 hover:scale-105 hover:-rotate-1
              ${blue ? "border-4 border-white" : "border-4 border-[#1A304B]"}`}
          />
        </div>

        <div
          className={`${blue ? "text-white" : "text-[#1A304B]"} ${reverse ? "md:order-1" : ""}`}
        >
          <div className="uppercase text-sm mb-2 tracking-widest opacity-60">
            Feature Highlight
          </div>

          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-90 mb-6">{text}</p>

          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${blue ? "bg-white" : "bg-[#1A304B]"}`}
                ></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
