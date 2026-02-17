import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";


// Role-based dashboard router
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

          {/* Login Route */}
          <Route path="/" element={<Login />} />

          {/* Register Route */}
          <Route path="/register" element={<Register />} />

          {/* Role-based Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Direct NGO Dashboard */}
          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute role="ngo">
                <NgoDashboard />
              </ProtectedRoute>
            }
          />

          {/* Direct Volunteer Dashboard */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute role="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
