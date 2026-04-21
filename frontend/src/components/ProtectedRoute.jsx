import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  // Check sessionStorage instead of localStorage
  const token = sessionStorage.getItem("token");
  const savedUser = sessionStorage.getItem("user");

  // If no session exists in THIS specific tab
  if (!token || !savedUser) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = user || JSON.parse(savedUser);
  const userRole = currentUser?.role?.toLowerCase();

  // Role validation for THIS tab
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const roleHomeBase = {
      admin: "/admin",
      ngo: "/ngo-dashboard",
      volunteer: "/volunteer-dashboard"
    };
    return <Navigate to={roleHomeBase[userRole] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;