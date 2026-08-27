import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  // Yahan AI Assistant ka button add kiya hai
  const links =
    user.role === "admin"
      ? [["Admin", "/admin"], ["Analytics", "/analytics"], ["🤖 AI Chat", "/ai-chat"]]
      : [["Dashboard", "/dashboard"], ["Candidates", "/candidates"], ["Vote", "/vote"], ["🤖 AI Chat", "/ai-chat"]];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <span className="font-bold text-lg text-white">🗳️ Secure Election</span>
      <div className="flex items-center gap-5">
        {links.map(([label, to]) => (
          <Link key={to} to={to} className="text-gray-300 hover:text-white text-sm transition">
            {label}
          </Link>
        ))}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm text-white"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}