import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";



// This router decides which dashboard to show based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  if (user.role === "ngo") {
    return <NgoDashboard />;
  }

  if (user.role === "volunteer") {
    return <VolunteerDashboard />;
  }

  // fallback
  return <VolunteerDashboard />;
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Login */}
          <Route path="/" element={<Login />} />

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
              <ProtectedRoute role="ngo">
                <NgoDashboard />
              </ProtectedRoute>
            }
          />

          {/* Direct Volunteer dashboard route */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute role="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
