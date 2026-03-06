import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";

import Login              from "./pages/Login";
import Register           from "./pages/Register";
import DashboardSelect    from "./pages/DashboardSelect";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard       from "./pages/NgoDashboard";
import Profile            from "./pages/Profile";
import CreateOpportunity  from "./pages/CreateOpportunity";
import EditOpportunity    from "./pages/EditOpportunity";
import Opportunities      from "./pages/Opportunities";
import ProtectedRoute     from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public ───────────────────────────────────────── */}
          <Route path="/"         element={<Login />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Auto-redirect based on role ───────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />

          {/* ── NGO routes ───────────────────────────────────── */}
          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-opportunity"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <CreateOpportunity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-opportunity/:id"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <EditOpportunity />
              </ProtectedRoute>
            }
          />

          {/* ── Volunteer routes ─────────────────────────────── */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Shared protected routes ──────────────────────── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <Opportunities />
              </ProtectedRoute>
            }
          />

          {/* ── Catch all ────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;