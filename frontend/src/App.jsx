import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

/* --------------------------------------------------
   Role-Based Dashboard Component
-------------------------------------------------- */
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  const role = user.role?.toLowerCase();

  if (role === "volunteer") {
    return <VolunteerDashboard />;
  }

  if (role === "ngo") {
    return <NgoDashboard />;
  }

  return <Navigate to="/" />;
};

/* --------------------------------------------------
   Main App Component
-------------------------------------------------- */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Protected Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;