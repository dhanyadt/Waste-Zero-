import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Show / Hide Password State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "volunteer",
  });
  const [error, setError] = useState("");


  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill all fields");
      setIsLoading(false);
      return;
    }

    // Clear error if valid
    setError("");

    try {
      const userData = {
        name:
          formData.role === "volunteer"
            ? "Volunteer User"
            : "NGO User",
        role: formData.role,
        email: formData.email,
      };

      login(userData);
      navigate("/dashboard");
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    
    // Temporary mock login for demo purposes
    const userData = {
      name: `${provider} User`,
      role: "volunteer",
      email: `user@${provider.toLowerCase()}.com`,
    };
    
    login(userData);
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-modal">
        <div className="modal-content">
          <div className="left-section">
            <div className="recycle-content">
              <div className="recycle-icon">
                <img src="/images/Logo.png" alt="Green Leaf Recycle Logo" />
              </div>
              <div className="recycle-text">
                <h3>WasteZero Initiative</h3>
                <p>Together we care for the future of the next generations</p>
              </div>
              <div className="world-recycle-day">
                <h4>World Recycling Day</h4>
                <p>17TH MAY</p>
              </div>
            </div>
          </div>
          
          <div className="right-section">
            <h2>Login</h2>
            <p>Enter your details to log in.</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
              
              {/* Password + Toggle */}
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>

              {/* Role Dropdown */}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input role-select"
              >
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO</option>
              </select>

              
              {/* Continue Button */}
              <button 
                type="submit" 
                className="continue-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Continue'}
              </button>
            </form>
            
            <div className="divider">OR</div>
            
            <div className="social-buttons">
              <button 
                className="social-btn google-btn"
                onClick={() => handleSocialLogin('Google')}
              >
                <span className="social-icon">🔍</span>
                Continue with Google
              </button>
              
              <button 
                className="social-btn facebook-btn"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <span className="social-icon">📘</span>
                Continue with Facebook
              </button>
              
              <button 
                className="social-btn apple-btn"
                onClick={() => handleSocialLogin('Apple')}
              >
                <span className="social-icon">🍎</span>
                Continue with Apple
              </button>
            </div>
            
            <div className="register-link">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="link">
                  Register
                </Link>
              </p>
            </div>
            
            <div className="terms">
              <small>
                By continuing, you agree to the updated{' '}
                <a href="/terms" className="link">Terms of Sale</a>,{' '}
                <a href="/terms" className="link">Terms of Service</a>, and{' '}
                <a href="/privacy" className="link">Privacy Policy</a>.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
