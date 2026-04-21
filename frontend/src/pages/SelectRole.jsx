import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const T = {
  gDeep: "#1b5e20",
  gDark: "#2e7d32",
  gMid: "#43a047",
  gLight: "#81c784",
  bDark: "#3e2723",
  bMid: "#5d4037",
  bLight: "#8d6e63",
  bPale: "#efebe9",
  bSand: "#d7ccc8",
  cream: "#fdf8f0",
  pageBg: "#f4ede0",
  textDark: "#1c1008",
  textMid: "#4b3f36",
  textSoft: "#7b6b63",
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: font,
  padding: "24px",
  backgroundColor: "#1a2e1a",
  backgroundImage: [
    "radial-gradient(ellipse at 15% 85%, rgba(67,160,71,.28) 0%, transparent 50%)",
    "radial-gradient(ellipse at 85% 15%, rgba(93,64,55,.35) 0%, transparent 50%)",
    "radial-gradient(ellipse at 50% 50%, rgba(27,94,32,.4) 0%, transparent 70%)",
    "linear-gradient(135deg, #1a2e1a 0%, #2e1a0e 50%, #1a1a0e 100%)",
  ].join(", "),
};

const SelectRole = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [role, setRole] = useState("volunteer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/set-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (data.success) {
        const savedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
        const updatedUser = { ...savedUser, role: data.role };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        updateUser(updatedUser);
        setTimeout(() => navigate("/dashboard"), 100);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "900px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,.07), 0 8px 32px rgba(0,0,0,.4), 0 32px 80px rgba(0,0,0,.5)",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            flex: "0 0 38%",
            background: `linear-gradient(155deg, ${T.gDark} 0%, ${T.gDeep} 40%, #2d1a0a 80%, ${T.bDark} 100%)`,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "52px 30px",
            gap: "22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative rings */}
          <div
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              borderRadius: "50%",
              border: "50px solid rgba(255,255,255,.04)",
              top: "-100px",
              left: "-100px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: "50px solid rgba(255,255,255,.03)",
              bottom: "-60px",
              right: "-60px",
              pointerEvents: "none",
            }}
          />

          {/* Logo */}
          <div
            style={{
              width: "92px",
              height: "92px",
              borderRadius: "50%",
              background: "rgba(255,255,255,.13)",
              border: "2px solid rgba(255,255,255,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.15)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <img
              src="/images/Logo.png"
              alt="WasteZero"
              style={{
                width: 58,
                height: 58,
                objectFit: "contain",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,.3))",
              }}
            />
          </div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <h3
              style={{
                fontFamily: serif,
                fontSize: 24,
                fontWeight: 800,
                marginBottom: 10,
                textShadow: "0 2px 8px rgba(0,0,0,.3)",
              }}
            >
              WasteZero
            </h3>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                lineHeight: 1.7,
                maxWidth: 190,
              }}
            >
              Choose how you want to contribute to a cleaner world.
            </p>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.15)",
              paddingTop: 18,
              textAlign: "center",
              width: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p
              style={{
                fontSize: 10.5,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                opacity: 0.55,
                marginBottom: 6,
              }}
            >
              Connect · Collect · Impact
            </p>
            <p
              style={{
                fontSize: 13,
                color: T.gLight,
                fontWeight: 600,
                textShadow: "0 0 16px rgba(129,199,132,.4)",
              }}
            >
              Join the Recycling Revolution
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 52px",
            background:
              "linear-gradient(160deg, #fdf8f0 0%, #f9f3e8 60%, #f4ede0 100%)",
            position: "relative",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: [
                "radial-gradient(ellipse at 80% 100%, rgba(93,64,55,.07) 0%, transparent 50%)",
                "radial-gradient(ellipse at 0% 0%, rgba(67,160,71,.06) 0%, transparent 40%)",
              ].join(", "),
            }}
          />

          <h2
            style={{
              fontFamily: serif,
              fontSize: "26px",
              fontWeight: 800,
              color: T.bDark,
              marginBottom: "8px",
              letterSpacing: "-.3px",
              position: "relative",
            }}
          >
            Almost there! 🌱
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: T.textSoft,
              marginBottom: "32px",
              position: "relative",
            }}
          >
            Select your role to get started with WasteZero
          </p>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#c62828",
                borderRadius: "10px",
                padding: "11px 14px",
                fontSize: "13.5px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {/* Role Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "28px",
              position: "relative",
            }}
          >
            {[
              {
                value: "volunteer",
                label: "Volunteer",
                icon: "🙋",
                desc: "Help NGOs with recycling drives and community events",
              },
              {
                value: "ngo",
                label: "NGO",
                icon: "🏢",
                desc: "Organize campaigns and manage volunteers effectively",
              },
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => setRole(option.value)}
                style={{
                  padding: "20px 16px",
                  borderRadius: "14px",
                  border:
                    role === option.value
                      ? `2px solid ${T.gMid}`
                      : `2px solid ${T.bSand}`,
                  background:
                    role === option.value
                      ? "rgba(67,160,71,.08)"
                      : "rgba(255,255,255,.6)",
                  cursor: "pointer",
                  transition: "all .2s",
                  boxShadow:
                    role === option.value
                      ? `0 0 0 3px rgba(67,160,71,.15)`
                      : "none",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                  {option.icon}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    color: T.bDark,
                    marginBottom: "6px",
                  }}
                >
                  {option.label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: T.textSoft,
                    lineHeight: 1.5,
                  }}
                >
                  {option.desc}
                </div>
                {role === option.value && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: T.gMid,
                    }}
                  >
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "13px",
              background: isLoading
                ? T.bSand
                : `linear-gradient(135deg, ${T.gMid} 0%, ${T.gDark} 60%, ${T.bMid} 100%)`,
              color: isLoading ? "#a09080" : "#fff",
              border: "none",
              borderRadius: "11px",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: font,
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: isLoading
                ? "none"
                : "0 4px 16px rgba(46,125,50,.35), inset 0 1px 0 rgba(255,255,255,.1)",
              transition: "opacity .2s, transform .15s",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.opacity = ".9";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = "1";
              e.target.style.transform = "translateY(0)";
            }}
          >
            {isLoading ? "Saving..." : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
