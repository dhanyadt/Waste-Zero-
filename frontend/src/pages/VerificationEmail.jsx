import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { verifyEmail, resendVerificationCode } from "../services/api";

export default function VerificationEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for code expiry
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code) {
      setError("Please enter the verification code");
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Code must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmail(email, code);
      const data = response.data;

      if (data.success) {
        setSuccess("Email verified successfully! Logging you in...");
        // Store token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Wait a moment then redirect to dashboard
        setTimeout(() => {
          const userRole = data.user.role?.toLowerCase();
          if (userRole === "ngo") {
            navigate("/ngo-dashboard");
          } else if (userRole === "volunteer") {
            navigate("/volunteer-dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await resendVerificationCode(email);
      const data = response.data;

      if (data.success) {
        setSuccess("New code sent to your email!");
        setCode("");
        setTimeLeft(3600); // Reset timer to 1 hour
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  // Redirect if no email
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            No Email Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please complete registration first.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We sent a verification code to:
            </p>
            <p className="text-gray-900 font-semibold mt-1">{email}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-center text-2xl tracking-widest placeholder-gray-400"
                disabled={loading || isResending}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in:{" "}
                  <span className="font-semibold text-green-600">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-600 font-semibold">
                  Code expired. Please request a new one.
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || !code || timeLeft <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Resend Button */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending || loading}
              className="text-green-600 hover:text-green-700 font-semibold text-sm disabled:text-gray-400 transition"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Check your spam folder if you don't see the email
            </p>
          </div>
        </div>

        {/* WasteZero Logo/Branding */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            WasteZero • Waste Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
