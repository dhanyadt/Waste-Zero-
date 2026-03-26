import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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
import AuthCallback from "./pages/AuthCallback";
import SelectRole from "./pages/SelectRole";
import Messages from "./pages/Messages";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminOpportunities from "./pages/AdminOpportunities";
import AdminReports from "./components/layout/AdminReports";
import AdminLogs from "./components/layout/AdminLogs";
import AdminRoute from "./components/layout/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard Redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSelect />
              </ProtectedRoute>
            }
          />

          {/* NGO */}
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

          {/* Volunteer */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared */}
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

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/opportunities" element={<AdminRoute><AdminOpportunities /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />

          {/* Others */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-role" element={<SelectRole />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;