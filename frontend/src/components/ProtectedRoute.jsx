import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!user && (!token || !savedUser)) {
    return <Navigate to="/" replace />;
  }

  const userRole = user.role?.toLowerCase();

  // If route has role restriction
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect based on actual role
    if (userRole === "ngo") {
      return <Navigate to="/ngo-dashboard" replace />;
    } else {
      return <Navigate to="/volunteer-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
