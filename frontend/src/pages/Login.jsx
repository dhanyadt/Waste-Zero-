import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Facebook } from "lucide-react";

// Simple SVG for Google and Apple logos to avoid new deps
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
    <path d="M533.5 278.4c0-18.5-1.5-37.6-4.7-55.6H272v105.4h146.9c-6.3 34-25.4 62.8-54.3 82v68.1h87.8c51.4-47.3 80.1-117.2 80.1-199.9z" fill="#4285F4"/>
    <path d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-87.8-68.1c-24.4 16.3-55.7 25.9-92.9 25.9-71.4 0-132-48.1-153.6-112.7H30.2v70.9C75.1 487.2 167.5 544.3 272 544.3z" fill="#34A853"/>
    <path d="M118.4 323.3c-11.6-34.9-11.6-72.7 0-107.6V144.8H30.2c-39.2 77.9-39.2 170.6 0 248.5l88.2-70z" fill="#FBBC05"/>
    <path d="M272 107.7c39.9 0 75.8 13.7 104.1 40.6l78-78C407.3 24.9 345.4 0 272 0 167.5 0 75.1 57.1 30.2 144.8l88.2 70C140 155.8 200.6 107.7 272 107.7z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.365 1.43c0 1.02-.39 2.02-1.1 2.76-.7.74-1.82 1.56-3.03 1.36-.07-1.05.37-2.18 1.08-2.93.73-.78 1.91-1.43 3.05-1.19zM12.7 6.5c1.85-.02 3.39 1.06 4.25 1.06.9 0 2.24-1.03 3.73-1.03.45 0 1.11.15 1.11.15-1.01 1.13-1.75 2.77-1.75 4.47 0 3.27 2.78 5.47 2.78 5.47-.49 1.55-1.52 3.13-2.78 3.99-1.78 1.2-3.11 1.21-3.97 1.21-1.05 0-1.63-.49-3.04-.49-1.39 0-2 .49-3.05.49-.86 0-2.24 0-4.02-1.21-1.38-.86-2.4-2.43-2.9-3.99 0 0 2.78-1.89 2.78-5.47 0-1.7-.74-3.34-1.75-4.47 0 0 .66-.21 1.11-.21 1.5 0 2.84 1.06 3.74 1.06.85 0 2.39-1.09 4.24-1.11z" />
  </svg>
);

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
      // Call backend through AuthContext
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate("/role-selection");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = (provider) => {
    // Redirect to backend OAuth endpoint which should handle provider flow
    // Backend routes expected: /api/auth/google, /api/auth/facebook, /api/auth/apple
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };


  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-green-400 to-green-200 items-center justify-center">
        <div className="text-center text-white px-8">
          <div className="mx-auto mb-6 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">♻️</div>
          <h1 className="text-3xl font-bold text-white mb-2">WasteZero Initiative</h1>
          <p className="text-white/90">Together we care for the future of the next generations</p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />

            <div className="flex items-center justify-between">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border p-2 rounded-md"
              >
                <option>Volunteer</option>
                <option>NGO</option>
              </select>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white p-3 rounded-md font-semibold ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>
          </form>

          {/* OR separator */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-3 text-sm text-gray-400">OR</div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social buttons stacked */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => socialLogin("google")}
              className="w-full flex items-center gap-3 border rounded-md p-3"
            >
              <GoogleIcon />
              <span className="flex-1 text-left">Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => socialLogin("facebook")}
              className="w-full flex items-center gap-3 border rounded-md p-3 bg-blue-600 text-white"
            >
              <Facebook className="w-5 h-5" />
              <span className="flex-1 text-left">Continue with Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => socialLogin("apple")}
              className="w-full flex items-center gap-3 border rounded-md p-3 bg-black text-white"
            >
              <AppleIcon />
              <span className="flex-1 text-left">Continue with Apple</span>
            </button>
          </div>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{' '}
            <Link to="/register" className="text-green-600 font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
