import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardSelect from "./pages/DashboardSelect";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import Profile from "./pages/Profile";
import CreateOpportunity from "./pages/CreateOpportunity";
import EditOpportunity from "./pages/EditOpportunity";
import Opportunities from "./pages/Opportunities";
import ProtectedRoute from "./components/ProtectedRoute";

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

          {/* Public Dashboard Selection (shows both options) */}
          <Route path="/dashboard-select" element={<DashboardSelect />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />

          {/* Separate Dashboard Routes */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer", "ngo"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute allowedRoles={["ngo", "volunteer"]}>
                <NgoDashboard />
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

          {/* Protected Create Opportunity (NGO Only) */}
          <Route
            path="/create-opportunity"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <CreateOpportunity />
              </ProtectedRoute>
            }
          />

          {/* Protected Edit Opportunity (NGO Only) */}
          <Route
            path="/edit-opportunity/:id"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <EditOpportunity />
              </ProtectedRoute>
            }
          />

          {/* Protected Opportunities Listing (All Users) */}
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <div style={{ display: "flex", minHeight: "100vh" }}>
                  <Sidebar />
                  <div style={{ flex: 1, overflow: "auto" }}>
                    <Opportunities />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Other Protected Routes (redirect to dashboard) */}
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/impact"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <DashboardSelect />
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
