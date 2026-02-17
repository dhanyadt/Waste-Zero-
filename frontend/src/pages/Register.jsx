import { useState } from "react";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import "./Login.css"; // Reuse login styling

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerUser(formData);

      console.log("Registration success:", response.data);

      alert("Registered successfully!");

      // Optional → redirect to login
      window.location.href = "/";

    } catch (err) {
      console.error("Register error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-modal">
        <div className="modal-content">

          {/* LEFT SECTION */}
          <div className="left-section">
            <div className="recycle-content">

              <div className="recycle-icon">
                <img src="/images/Logo.png" alt="WasteZero Logo" />
              </div>

              <div className="recycle-text">
                <h3>WasteZero Initiative</h3>
                <p>
                  Together we care for the future of the next generations
                </p>
              </div>

              <div className="world-recycle-day">
                <h4>World Recycling Day</h4>
                <p>17TH MAY</p>
              </div>

            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="right-section">
            <h2>Register</h2>
            <p>Create your account to get started.</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">

              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />

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

              {/* Password */}
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
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

              {/* Confirm Password */}
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />

              {/* Role */}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input role-select"
              >
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO</option>
              </select>

              {/* Register Button */}
              <button
                type="submit"
                className="continue-btn"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>

            </form>

            <div className="register-link">
              <p>
                Already have an account?{" "}
                <Link to="/" className="link">
                  Login
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
