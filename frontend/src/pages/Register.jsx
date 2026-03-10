import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { API_BASE_URL } from "../services/config";

const T = {
  gDeep: "#1b5e20",
  gDark: "#2e7d32",
  gMid: "#43a047",
  gLight: "#81c784",
  gPale: "#c8e6c9",
  gSage: "#a5c8a0",
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

const S = {
  card: {
    display: "flex",
    width: "100%",
    maxWidth: "980px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,.07), 0 8px 32px rgba(0,0,0,.4), 0 32px 80px rgba(0,0,0,.5)",
  },
  left: {
    flex: "0 0 35%",
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
  },
  ring: (w, h, top, left, bottom, right, op) => ({
    position: "absolute",
    width: w,
    height: h,
    borderRadius: "50%",
    border: `50px solid rgba(255,255,255,${op})`,
    top,
    left,
    bottom,
    right,
    pointerEvents: "none",
  }),
  logoWrap: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background: "rgba(255,255,255,.13)",
    border: "2px solid rgba(255,255,255,.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.15)",
    position: "relative",
    zIndex: 1,
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "36px 48px",
    background:
      "linear-gradient(160deg, #fdf8f0 0%, #f9f3e8 60%, #f4ede0 100%)",
    overflowY: "auto",
    position: "relative",
  },
  rightGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: [
      "radial-gradient(ellipse at 80% 100%, rgba(93,64,55,.07) 0%, transparent 50%)",
      "radial-gradient(ellipse at 0% 0%, rgba(67,160,71,.06) 0%, transparent 40%)",
    ].join(", "),
  },
  tabs: {
    display: "flex",
    borderRadius: "10px",
    background: T.bPale,
    padding: "4px",
    marginBottom: "20px",
    gap: "4px",
  },
  tab: (a) => ({
    flex: 1,
    padding: "9px",
    borderRadius: "8px",
    border: "none",
    fontFamily: font,
    fontSize: "14px",
    fontWeight: a ? 600 : 500,
    cursor: "pointer",
    background: a ? T.cream : "transparent",
    color: a ? T.bDark : T.textSoft,
    boxShadow: a ? "0 1px 4px rgba(62,39,35,.1)" : "none",
    transition: "all .2s",
  }),
  h2: {
    fontFamily: serif,
    fontSize: "24px",
    fontWeight: 800,
    color: T.bDark,
    marginBottom: "4px",
    letterSpacing: "-.3px",
    position: "relative",
  },
  sub: {
    fontSize: "13.5px",
    color: T.textSoft,
    marginBottom: "20px",
    position: "relative",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  field: { marginBottom: "14px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: T.bMid,
    marginBottom: "5px",
    letterSpacing: ".4px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${T.bSand}`,
    borderRadius: "11px",
    fontSize: "14px",
    fontFamily: font,
    color: T.textDark,
    background: "rgba(255,255,255,.7)",
    backdropFilter: "blur(4px)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${T.bSand}`,
    borderRadius: "11px",
    fontSize: "14px",
    fontFamily: font,
    color: T.textDark,
    background: "rgba(255,255,255,.7)",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b5c52' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: (loading) => ({
    width: "100%",
    padding: "13px",
    background: loading
      ? T.bSand
      : `linear-gradient(135deg, ${T.gMid} 0%, ${T.gDark} 60%, ${T.bMid} 100%)`,
    color: loading ? "#a09080" : "#fff",
    border: "none",
    borderRadius: "11px",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: font,
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "6px",
    marginBottom: "16px",
    boxShadow: loading
      ? "none"
      : "0 4px 16px rgba(46,125,50,.35), inset 0 1px 0 rgba(255,255,255,.1)",
    transition: "opacity .2s, transform .15s",
  }),
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#c62828",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13.5px",
    marginBottom: "16px",
  },
  
  link: { color: T.gDark, textDecoration: "none", fontWeight: 700 },
  pwWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: T.bLight,
    lineHeight: 1,
  },
};

const focusOn = (e) => {
  e.target.style.borderColor = T.gMid;
  e.target.style.boxShadow = "0 0 0 3px rgba(67,160,71,.15)";
  e.target.style.background = "rgba(255,255,255,.95)";
};
const focusOff = (e) => {
  e.target.style.borderColor = T.bSand;
  e.target.style.boxShadow = "none";
  e.target.style.background = "rgba(255,255,255,.7)";
};

const Register = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "volunteer",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Google Authentication
  const handleGoogleSignup = () => {
   window.location.href = `${API_BASE_URL}/auth/google`;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    const { confirmPassword, ...registerData } = formData;

    registerData.role = registerData.role.toLowerCase();
    registerData.email = registerData.email.toLowerCase().trim();

    try {
      await registerUser(registerData);

      setSuccess("Account created successfully! Please login.");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "";

      if (errorMessage.includes("already exists")) {
        setError("An account with this email already exists. Please login.");
      } else {
        setError(errorMessage || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const inp = (name, placeholder, type = "text", extra = {}) => (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={formData[name]}
      onChange={handleChange}
      onFocus={focusOn}
      onBlur={focusOff}
      style={{ ...S.input, ...extra }}
      required
    />
  );

  return (
    <div style={pageStyle}>
      <div style={S.card}>
        <div style={S.left}>
          <div
            style={S.ring(
              360,
              360,
              "-100px",
              "-100px",
              undefined,
              undefined,
              ".04",
            )}
          />
          <div
            style={S.ring(
              220,
              220,
              undefined,
              undefined,
              "-60px",
              "-60px",
              ".03",
            )}
          />
          <div
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(129,199,132,.2) 0%, transparent 70%)",
              top: "35%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              pointerEvents: "none",
            }}
          />
          <div style={S.logoWrap}>
            <img
              src="/images/Logo.png"
              alt="WasteZero"
              style={{
                width: 58,
                height: 58,
                objectFit: "contain",
                animation: "spin 22s linear infinite",
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
              Connect with volunteers and NGOs to make recycling a reality.
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
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <div style={S.right}>
          <div style={S.rightGlow} />
          <div style={S.tabs}>
            <button style={S.tab(false)} onClick={() => navigate("/")}>
              Login
            </button>
            <button style={S.tab(true)}>Register</button>
          </div>
          <h2 style={S.h2}>Create a new account</h2>
          <p style={S.sub}>Fill in your details to join WasteZero</p>
          {error && <div style={S.error}>{error}</div>}
          {success && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: "10px",
                padding: "11px 14px",
                fontSize: "13.5px",
                marginBottom: "16px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Full Name</label>
                {inp("name", "Your full name")}
              </div>
              <div>
                <label style={S.label}>Email</label>
                {inp("email", "Your email", "email")}
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Username</label>
              {inp("username", "Choose a username")}
            </div>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Password</label>
                <div style={S.pwWrap}>
                  {inp(
                    "password",
                    "Create a password",
                    showPassword ? "text" : "password",
                    { paddingRight: "40px" },
                  )}
                  <button
                    type="button"
                    style={S.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>
              <div>
                <label style={S.label}>Confirm Password</label>
                <div style={S.pwWrap}>
                  {inp(
                    "confirmPassword",
                    "Confirm your password",
                    showConfirmPassword ? "text" : "password",
                    { paddingRight: "40px" },
                  )}
                  <button
                    type="button"
                    style={S.eyeBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onFocus={focusOn}
                onBlur={focusOff}
                style={S.select}
              >
                <option value="volunteer">Volunteer</option>
                <option value="NGO">NGO</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              style={S.btn(isLoading)}
              disabled={isLoading}
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
              {isLoading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <div className="lc-divider">OR</div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "10px",
              border: "1.5px solid #e0e0e0",
              borderRadius: "11px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#3c3c3c",
              background: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              transition: "box-shadow 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = "0 3px 10px rgba(0,0,0,0.15)";
              e.target.style.background = "#f7f7f7";
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
              e.target.style.background = "#ffffff";
            }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Continue with Google
          </button>
          <p
            style={{
              textAlign: "center",
              fontSize: "13.5px",
              color: T.textSoft,
              position: "relative",
            }}
          >
            Already have an account?{" "}
            <Link to="/" style={S.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
