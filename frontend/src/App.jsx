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
import ChatPage from "./pages/ChatPage";
import Matches from "./pages/Matches";
import SelectRole from "./pages/SelectRole";
import Messages from "./pages/Messages";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* DASHBOARD */}
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
  path="/opportunities/:id"
  element={
    <ProtectedRoute>
      <Opportunities />
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

          {/* VOLUNTEER */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* SHARED */}
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
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />

          {/* 🔥 IMPORTANT FIX */}
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

          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-role" element={<SelectRole />} />

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;