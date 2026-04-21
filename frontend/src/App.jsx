import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
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
import ChatPage from "./pages/ChatPage";
import Matches from "./pages/Matches";
import SelectRole from "./pages/SelectRole";
import Messages from "./pages/Messages";

// Admin 
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminOpportunities from "./pages/AdminOpportunities";
import AdminReports from "./components/layout/AdminReports";
import AdminLogs from "./components/layout/AdminLogs";
import AdminRoute from "./components/layout/AdminRoute";

import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="main-bg">
            <Routes>

              {/* PUBLIC */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* DASHBOARD SELECTION */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardSelect />
                  </ProtectedRoute>
                }
              />

              {/* NGO ROUTES */}
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

              {/* VOLUNTEER ROUTES */}
              <Route
                path="/volunteer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["volunteer"]}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* SHARED PROTECTED ROUTES */}
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
                path="/opportunities/:id"
                element={
                  <ProtectedRoute>
                    <Opportunities />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Matches />
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

              <Route
                path="/messages/:receiverId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/opportunities" element={<AdminRoute><AdminOpportunities /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
              <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />

              {/* OTHERS */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/select-role" element={<SelectRole />} />

              {/* CATCH ALL */}
              <Route path="*" element={<Navigate to="/" />} />

            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;