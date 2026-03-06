import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    // Always verify token + fetch fresh user from server on app load
    // This prevents stale role/data bugs from localStorage cache
    const fetchFreshUser = async () => {
      try {
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const freshUser = res.data.user || res.data;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser)); // keep in sync
      } catch (err) {
        // Token invalid or expired — clear everything
        console.error("Session restore failed:", err.message);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("dashboard"); // ← also clear dashboard choice
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("dashboard"); // ← clear on logout so next user starts fresh
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);