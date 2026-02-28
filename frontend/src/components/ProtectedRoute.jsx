import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!user && (!token || !savedUser)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
