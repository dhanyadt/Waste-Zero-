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
    return <Navigate to="/" />;
  }

  // If allowedRoles is specified, check user role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;
