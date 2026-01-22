import { useContext, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white shadow-md px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
        <img src="/logo.png" alt="Vyapaar360" className="h-8" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-[#1A304B] font-medium">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/products">Products</Link>
          <Link to="/purchase">Purchase</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/ai-insights">Smart Insights</Link>
          <Link to="/reports">Reports</Link>

          
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Profile */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-full bg-[#1A304B] text-white font-bold"
          >
            {user?.email?.[0]?.toUpperCase()}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow">
              <div className="p-3 border-b">
                <p className="font-semibold">{user?.shopName}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
  <div className="md:hidden bg-white shadow-md border-t">
    <Link
      to="/dashboard"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Dashboard
    </Link>

    <Link
      to="/products"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Products
    </Link>

    <Link
      to="/purchase"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Purchase
    </Link>

    <Link
      to="/sales"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Sales
    </Link>

    <Link
      to="/customers"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Customers
    </Link>

    <Link
      to="/ai-insights"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Smart Insights
    </Link>

    <Link
      to="/reports"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 border-b text-[#1A304B]"
    >
      Reports
    </Link>

    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-3 text-red-600 font-medium"
    >
      Logout
    </button>
  </div>
)}


      {/* Page content */}
      <main className="p-4 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </>
  );
}
