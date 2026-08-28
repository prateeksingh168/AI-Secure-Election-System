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
      if (user.role?.toLowerCase() === "admin") {
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#020617] relative overflow-hidden cyber-grid">
      {/* Decorative atmospheric glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none animate-pulse-glow" />

      <form onSubmit={handleSubmit} className="glass-panel-premium p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 space-y-6 border border-white/5">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <span className="drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">🗳️</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-400">
              Portal Access
            </span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Secure Gatekeeper Authentication</p>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-xs p-4 rounded-xl text-center font-medium leading-relaxed">
            ⚠️ {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Email Address</label>
          <input
            type="email" 
            required
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white outline-none focus:border-blue-500 transition text-sm font-semibold backdrop-blur-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Password</label>
          <input
            type="password" 
            required
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white outline-none focus:border-blue-500 transition text-sm font-semibold backdrop-blur-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button 
          type="submit"
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50 text-sm duration-300 transform hover:-translate-y-0.5"
        >
          {loading ? "Decrypting Credentials..." : "Authenticate Portal Key"}
        </button>

        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-2">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest text-center">Demo Environment Credentials</p>
          <p className="text-[10px] text-slate-400 text-center leading-relaxed font-semibold">
            Voter: <span className="text-white font-bold">voter001@demo-election.local</span> / <span className="text-white font-bold">password123</span><br />
            Admin: <span className="text-white font-bold">admin@demo-election.local</span> / <span className="text-white font-bold">password123</span>
          </p>
        </div>
      </form>
    </div>
  );
}