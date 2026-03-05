import { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // user state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  }, []);

  // Login function - calls API
  const login = async (email, password, role) => {
    try {
      // For demo purposes, if no credentials provided, create a mock user with selected role
      if (!email || !password) {
        const userData = {
          id: "demo-user",
          name: role === "ngo" ? "Demo NGO User" : "Demo Volunteer",
          email: role === "ngo" ? "ngo@demo.com" : "volunteer@demo.com",
          role: role, // Use the selected role from login page
          skills: [],
          location: "",
          bio: "",
        };

        console.log("Demo mode - creating user with role:", role);

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "demo-token");

        return { success: true };
      }

      // Try to call the API
      const data = await apiLogin(email, password);

      // Use role from API response (real authentication)
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        skills: data.user.skills,
        location: data.user.location,
        bio: data.user.bio,
      };

      console.log("API login - user role from server:", data.user.role);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      // If API fails (e.g., backend not running), fall back to demo mode with selected role
      console.log("API not available, using demo mode with role:", role);

      const userData = {
        id: "demo-user",
        name: email || (role === "ngo" ? "NGO User" : "Volunteer User"),
        email:
          email || (role === "ngo" ? "ngo@demo.com" : "volunteer@demo.com"),
        role: role || "volunteer", // Use the selected role
        skills: [],
        location: "",
        bio: "",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", "demo-token");

      return { success: true };
    }
  };

  // Register function - calls API
  const register = async (userData) => {
    try {
      const data = await apiRegister(userData);

      const newUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      // If API fails, create demo user
      console.log("API not available, using demo mode");

      const newUser = {
        id: "demo-user-" + Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", "demo-token");

      return { success: true };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Update profile picture
  const updateProfilePicture = (profilePicture) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      profilePicture,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Update availability (useful for volunteers)
  const updateAvailability = (isAvailable) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      isAvailable,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        updateProfilePicture,
        updateAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
