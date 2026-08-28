import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user
    ? user.role?.toLowerCase() === "admin"
      ? [
          ["Admin Dashboard", "/admin/dashboard"],
          ["Analytics", "/admin/analytics"],
          ["🤖 AI Chat", "/admin/ai-chat"]
        ]
      : [
          ["Voter Dashboard", "/voter/dashboard"],
          ["Candidates", "/voter/candidates"],
          ["Vote", "/voter/vote"],
          ["🤖 AI Chat", "/voter/ai-chat"]
        ]
    : [
        ["Home", "/"],
        ["Voter Portal", "/voter"],
        ["Admin Portal", "/admin"]
      ];

  return (
    <nav className="glass-nav px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-blue-400 transition">
        <span>🗳️</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-400">
          Secure Election
        </span>
      </Link>
      <div className="flex items-center gap-5">
        {links.map(([label, to]) => (
          <Link key={to} to={to} className="text-slate-300 hover:text-white text-sm transition font-medium">
            {label}
          </Link>
        ))}
        {user ? (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-4 py-1.5 rounded-xl text-sm font-semibold text-red-400 transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}