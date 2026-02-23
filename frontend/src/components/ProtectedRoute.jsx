import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

<<<<<<< HEAD
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
=======
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;