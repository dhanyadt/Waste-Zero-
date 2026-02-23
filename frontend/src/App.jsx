import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
=======
import { useAuth, AuthProvider } from "./context/AuthContext";
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5

import Login from "./pages/Login";
import Register from "./pages/Register";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
<<<<<<< HEAD
import RoleSelection from "./pages/RoleSelection";
import BioSetup from "./pages/BioSetup";

import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
=======
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5

/* --------------------------------------------------
   Role-Based Dashboard Component
-------------------------------------------------- */
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

<<<<<<< HEAD
  const userRole = user.role?.toLowerCase() || "volunteer";

  if (userRole === "ngo") {
    return <NgoDashboard />;
  }

  if (userRole === "volunteer") {
=======
  const role = user.role?.toLowerCase();

  if (role === "volunteer") {
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
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
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

<<<<<<< HEAD
          {/* Role Selection after login */}
          <Route
            path="/role-selection"
            element={
              <ProtectedRoute>
                <RoleSelection />
              </ProtectedRoute>
            }
          />

          {/* Bio Setup */}
          <Route
            path="/bio-setup"
            element={
              <ProtectedRoute>
                <BioSetup />
              </ProtectedRoute>
            }
          />

          {/* Role-based dashboard */}
=======
          {/* Protected Dashboard */}
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
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
<<<<<<< HEAD
                <NgoDashboard />
=======
                <Profile />
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
              </ProtectedRoute>
            }
          />

<<<<<<< HEAD
          {/* Direct Volunteer dashboard route */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
=======
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5

        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;