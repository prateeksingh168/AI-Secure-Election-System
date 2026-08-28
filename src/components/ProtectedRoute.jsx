import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const isAdminPath = location.pathname.startsWith("/admin");
    return <Navigate to={isAdminPath ? "/admin" : "/voter"} replace />;
  }

  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    const isUserAdmin = user.role?.toLowerCase() === "admin";
    return <Navigate to={isUserAdmin ? "/admin/dashboard" : "/voter/dashboard"} replace />;
  }

  return children;
}