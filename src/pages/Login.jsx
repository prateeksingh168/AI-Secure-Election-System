import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "voter001@demo-election.local", password: "password123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please verify database connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[80px]" />

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>🗳️</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-400">
              Portal Access
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">Secure Election Gateway</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Address</label>
          <input
            type="email" 
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition text-sm font-medium"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Password</label>
          <input
            type="password" 
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition text-sm font-medium"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button 
          type="submit"
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-white transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50 text-sm"
        >
          {loading ? "Authenticating..." : "Authenticate Account"}
        </button>

        <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1">
          <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider text-center">Demo Environment Credentials</p>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Voter: <span className="text-white font-medium">voter001@demo-election.local</span> / <span className="text-white font-medium">password123</span><br />
            Admin: <span className="text-white font-medium">admin@demo-election.local</span> / <span className="text-white font-medium">password123</span>
          </p>
        </div>
      </form>
    </div>
  );
}