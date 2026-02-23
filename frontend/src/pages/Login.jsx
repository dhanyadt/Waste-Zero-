import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.email || !formData.password) { setError("Please fill all fields"); setIsLoading(false); return; }
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      login(data.user);
      navigate("/dashboard");
    } catch { setError("Login failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  const handleSocialLogin = (provider) => {
    login({ name: `${provider} User`, role: "volunteer", email: `user@${provider.toLowerCase()}.com` });
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
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

        <div className="lc-right">
          <h2>Login</h2>
          <p>Enter your details to log in.</p>
          {error && <div className="lc-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="lc-field">
              <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className="lc-input" required />
            </div>
            <div className="lc-field">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} className="lc-input" style={{ paddingRight: "44px" }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="lc-eye">{showPassword ? "👁️" : "🔒"}</button>
            </div>
            <button type="submit" className="lc-submit" disabled={isLoading}>{isLoading ? "Logging in…" : "Continue"}</button>
          </form>
          <div className="lc-divider">OR</div>
          
          <p className="lc-register-link">Don't have an account? <Link to="/register" className="lc-link">Register</Link></p>
          <p className="lc-terms">By continuing, you agree to the updated <a href="/terms" className="lc-link">Terms of Sale</a>, <a href="/terms" className="lc-link">Terms of Service</a>, and <a href="/privacy" className="lc-link">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;