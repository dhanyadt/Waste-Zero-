import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// DashboardSelect: automatically routes users to the correct dashboard
// based on their actual role from AuthContext — no manual selection needed,
// no localStorage dashboard key required.
const DashboardSelect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    const role = user.role?.toLowerCase();

    if (role === "ngo") {
      navigate("/ngo-dashboard", { replace: true });
    } else if (role === "volunteer") {
      navigate("/volunteer-dashboard", { replace: true });
    } else {
      // Unknown role — send back to login
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show nothing while redirecting
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: "#8d6e63", fontSize: 15 }}>Redirecting to your dashboard…</p>
    </div>
  );
};

export default DashboardSelect;