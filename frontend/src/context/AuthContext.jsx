import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserProfile, updateUserProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Try to validate token with backend
          const response = await getUserProfile();
          setUser(response.data.user);
        } catch (err) {
          console.error("Token validation failed, using localStorage data:", err);
          // If validation fails, still use the saved user from localStorage
          try {
            setUser(JSON.parse(savedUser));
          } catch (parseErr) {
            console.error("Failed to parse saved user:", parseErr);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);


  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(credentials);
      // Registration returns email and userId, not token
      // User must verify email first
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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


  // Update profile (bio, location, skills, name, etc.) by calling backend
  const updateProfile = async (data) => {
    try {
      const response = await updateUserProfile(data);
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error("Failed to update profile:", err);
      throw err;
    }
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
        error,
        login,
        register,
        logout,
        updateProfilePicture,
        updateProfile,
        updateAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// custom hook
export const useAuth = () => useContext(AuthContext);
