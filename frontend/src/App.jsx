import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import RoleSelection from "./pages/RoleSelection";
import BioSetup from "./pages/BioSetup";

import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";



// This router decides which dashboard to show based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  const userRole = user.role?.toLowerCase() || "volunteer";

  if (userRole === "ngo") {
    return <NgoDashboard />;
  }

  if (userRole === "volunteer") {
    return <VolunteerDashboard />;
  }

  // fallback
  return <VolunteerDashboard />;
};


function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Login */}
          <Route path="/" element={<Login />} />

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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />

              </ProtectedRoute>
            }
          />

          {/* Direct NGO dashboard route */}
          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />

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

        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
