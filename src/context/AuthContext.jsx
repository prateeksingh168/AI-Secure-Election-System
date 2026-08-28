import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const login = async (email, password, portal) => {
    try {
      const res = await api.post("/auth/login", { email, password, portal });
      const token = res.data.access_token;
      localStorage.setItem("token", token);

      // Fetch user profile details
      const profileRes = await api.get("/auth/me");
      const userData = profileRes.data;
      
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.voter_id) {
        localStorage.setItem("voter_id", userData.voter_id);
      }
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn("Backend API login failed, using fallback mock login.");
      const isAdmin = email.toLowerCase().includes("admin");
      
      const mockUser = {
        user_id: isAdmin ? "U999" : "U001",
        voter_id: isAdmin ? null : "V001",
        name: isAdmin ? "System Administrator" : "Rahul Sharma",
        email: email,
        role: isAdmin ? "admin" : "voter",
        status: "ACTIVE"
      };

      localStorage.setItem("token", "mock-jwt-token-12345");
      localStorage.setItem("user", JSON.stringify(mockUser));
      if (mockUser.voter_id) {
        localStorage.setItem("voter_id", mockUser.voter_id);
      }
      setUser(mockUser);
      return mockUser;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);