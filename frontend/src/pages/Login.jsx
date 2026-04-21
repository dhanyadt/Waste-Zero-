import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Sending login request:", formData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Clear old session but keep theme preference
      const currentTheme = sessionStorage.getItem("theme");
      sessionStorage.clear();
      if (currentTheme) sessionStorage.setItem("theme", currentTheme);

      // Save new session
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Update React context
      updateUser(data.user);

      console.log("Login successful:", data.user);

      // Redirect by role
      if (data.user.role === "admin") {
  navigate("/admin");
} else if (data.user.role === "ngo") {
  navigate("/ngo-dashboard");
} else {
  navigate("/volunteer-dashboard");
}

    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT PANEL */}
        <div className="lc-left">
          <div className="lc-left-glow" />

          <div className="lc-brand">
            <div className="lc-logo-wrap">
              <img src="/images/Logo.png" alt="WasteZero Logo" />
            </div>

            <h3>WasteZero Initiative</h3>
            <p>Together we care for the future of the next generations</p>
          </div>

          <div className="lc-day">
            <span>World Recycling Day</span>
            <strong>17TH MAY</strong>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lc-right">

          <h2>Login</h2>
          <p>Enter your details to log in.</p>

          {error && <div className="lc-error">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="lc-field">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="lc-input"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="lc-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="lc-input"
                style={{ paddingRight: "44px" }}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="lc-eye"
              >
                {showPassword ? "👁️" : "🔒"}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="lc-submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in…" : "Continue"}
            </button>

          </form>

          {/* DIVIDER */}
          <div className="lc-divider">OR</div>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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
            }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Continue with Google
          </button>

          {/* REGISTER LINK */}
          <p className="lc-register-link">
            Don't have an account?{" "}
            <Link to="/register" className="lc-link">
              Register
            </Link>
          </p>

          {/* TERMS */}
          <p className="lc-terms">
            By continuing, you agree to the updated{" "}
            <a href="/terms" className="lc-link">Terms of Sale</a>,{" "}
            <a href="/terms" className="lc-link">Terms of Service</a>, and{" "}
            <a href="/privacy" className="lc-link">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;