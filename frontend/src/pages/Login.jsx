import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });

      login(res.data.token , res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="border border-[#007A33] min-h-screen flex items-center justify-center bg-[#A3ADC0]">
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-[#1A304B] p-6 rounded-lg shadow-md w-80"
      >
        
        <div className="logo-wrapper">
          <img src="/logo.png" alt="Company Logo" className="login-logo" />
        </div>
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-full mb-3 p-2 border border-[#1A304B] "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border border-[#1A304B] rounded-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-[#1A304B] text-white py-2 rounded-full hover:bg-[#3c7fd1]"
        >
          Login
        </button>
        <p className="text-sm text-center mt-4">
  Don’t have an account?{" "}
  <span
    onClick={() => navigate("/register")}
    className="text-[#1A304B] font-semibold cursor-pointer hover:underline"
  >
    Register
  </span>
</p>

      </form>
    </div>
  );
}
