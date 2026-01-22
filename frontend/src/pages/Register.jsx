import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    shopAddress: "",
    gstNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankIFSC: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/register", formData);
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#A3ADC0]">
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-[#1A304B] p-6 rounded-lg shadow-md w-[340px]"
      >
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Vyapaar360" className="h-14" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4">Register</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              name="name"
              placeholder="Full Name"
              className="w-full mb-3 p-2 border border-[#1A304B] rounded-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border border-[#1A304B] rounded-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full mb-4 p-2 border border-[#1A304B] rounded-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-[#1A304B] text-white py-2 rounded-full"
            >
              Next
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#1A304B] font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              name="shopName"
              placeholder="Shop Name"
              className="w-full mb-3 p-2 border border-[#1A304B] rounded-full"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
            <input
              name="shopAddress"
              placeholder="Shop Address"
              className="w-full mb-4 p-2 border border-[#1A304B] rounded-full"
              value={formData.shopAddress}
              onChange={handleChange}
              required
            />
            <input
              name="gstNumber"
              placeholder="GST Number"
              className="w-full mb-4 p-2 border border-[#1A304B] rounded-full"
              value={formData.gstNumber}
              onChange={handleChange}
              required
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 border border-[#1A304B] py-2 rounded-full"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="w-1/2 bg-[#1A304B] text-white py-2 rounded-full"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              name="bankName"
              placeholder="Bank Name"
              className="w-full mb-3 p-2 border border-[#1A304B] rounded-full"
              value={formData.bankName}
              onChange={handleChange}
              required
            />
            <input
              name="bankAccountNumber"
              placeholder="Account Number"
              className="w-full mb-3 p-2 border border-[#1A304B] rounded-full"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              required
            />
            <input
              name="bankIFSC"
              placeholder="IFSC Code"
              className="w-full mb-4 p-2 border border-[#1A304B] rounded-full"
              value={formData.bankIFSC}
              onChange={handleChange}
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 border border-[#1A304B] py-2 rounded-full"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-[#1A304B] text-white py-2 rounded-full"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
