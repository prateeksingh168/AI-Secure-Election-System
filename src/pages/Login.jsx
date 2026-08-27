import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "voter@gmail.com", password: "123456" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold mb-1 text-white">🗳️ Secure Election</h1>
        <p className="text-gray-400 mb-6 text-sm">Voter / Admin Login Portal</p>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1 font-medium">Email Address</label>
          <input
            type="email" 
            required
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-xs mb-1 font-medium">Password</label>
          <input
            type="password" 
            required
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button 
          type="submit"
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-semibold text-white transition disabled:opacity-50 text-sm"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center bg-gray-800/50 p-3 rounded-xl border border-gray-800">
          <p className="text-green-400 text-xs">
            💡 <b className="text-white">voter@gmail.com</b> dalo ge toh Voter Dashboard khulega, <b className="text-white">admin@gmail.com</b> dalo ge toh Admin Panel khulega!
          </p>
        </div>
      </form>
    </div>
  );
}