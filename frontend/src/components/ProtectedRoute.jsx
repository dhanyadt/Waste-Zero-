import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
