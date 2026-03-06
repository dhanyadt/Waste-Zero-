import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const requireRole = params.get("requireRole") === "true";
    const userParam = params.get("user");

    console.log("token:", token);
    console.log("requireRole:", requireRole);
    console.log("userParam:", userParam); 

    if (!token) {
      navigate("/");
      return;
    }

    let user = null;
    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (e) {
        console.error("User parse error", e);
      }
    }

    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); // ✅ இது add pannu
      updateUser(user);
    }

    setTimeout(() => {
      if (requireRole) {
        navigate("/select-role");
      } else {
        navigate("/dashboard");
      }
    }, 150); 
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <p>Logging you in... ⏳</p>
    </div>
  );
};

export default AuthCallback;
