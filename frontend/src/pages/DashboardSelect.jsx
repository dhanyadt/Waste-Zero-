import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const DashboardSelect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === "ngo") {
      navigate("/ngo-dashboard");
    } else if (selectedRole === "volunteer") {
      navigate("/volunteer-dashboard");
    }
  };

  const roleOptions = [
    {
      id: "ngo",
      title: "NGO Dashboard",
      description: "Create and manage opportunities, track volunteers, and make an impact",
      icon: "🏢",
      color: "#2e7d32"
    },
    {
      id: "volunteer",
      title: "Volunteer Dashboard",
      description: "Find opportunities, track your impact, and connect with NGOs",
      icon: "🤝",
      color: "#1565c0"
    }
  ];

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "600px" }}>
        <div className="lc-right" style={{ flex: 1, padding: "40px" }}>
          <h2 style={{ marginBottom: "8px" }}>{user ? "Welcome back!" : "Welcome!"}</h2>
          {user ? (
            <p style={{ marginBottom: "24px", color: "#666" }}>
              Logged in as: <strong>{user?.name}</strong> ({user?.email})
            </p>
          ) : (
            <p style={{ marginBottom: "24px", color: "#666" }}>
              Please select a dashboard to continue. <a href="/" style={{ color: "#2e7d32" }}>Login</a> or <a href="/register" style={{ color: "#2e7d32" }}>Register</a> for full access.
            </p>
          )}
          <p style={{ marginBottom: "24px" }}>Select a dashboard to continue:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            {roleOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedRole(option.id)}
                style={{
                  padding: "20px",
                  border: `2px solid ${selectedRole === option.id ? option.color : "#ddd"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  backgroundColor: selectedRole === option.id ? `${option.color}10` : "white",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}
              >
                <div style={{ fontSize: "32px" }}>{option.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 4px 0", color: option.color }}>{option.title}</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{option.description}</p>
                </div>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: `2px solid ${selectedRole === option.id ? option.color : "#ddd"}`,
                  backgroundColor: selectedRole === option.id ? option.color : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px"
                }}>
                  {selectedRole === option.id && "✓"}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: selectedRole ? "#2e7d32" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: selectedRole ? "pointer" : "not-allowed",
              transition: "background-color 0.2s"
            }}
          >
            Continue to Dashboard
          </button>

          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#666" }}>
            Not {user?.name}? <a href="/" style={{ color: "#2e7d32" }}>Switch account</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelect;
