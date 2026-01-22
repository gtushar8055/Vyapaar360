export default function Footer() {
  return (
    <footer className="bg-white border-t w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/logo.png"
                alt="Vyapaar360"
                className="h-8 w-auto"
              />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              Manage your shop smarter — inventory, purchases, sales,
              GST and insights — all in one place.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A304B] mb-3">
              CONTACT
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@vyapaar360.com</li>
              <li>Phone: +91 98765 43XXX</li>
              <li>Bulandshahr UP , India</li>
            </ul>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A304B] mb-3">
              PRODUCT
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Dashboard</li>
              <li>Products</li>
              <li>Purchase & Sales</li>
              <li>GST Reports</li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A304B] mb-3">
              HELP
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>How it works</li>
              <li>FAQs</li>
              <li>Support</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t my-6" />

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Vyapaar360 (Tushar Gupta). All rights reserved.</p>

          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-[#1A304B]">
              Privacy
            </span>
            <span className="cursor-pointer hover:text-[#1A304B]">
              Terms & Conditions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
