import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // user state
  const [user, setUser] = useState(null);


  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

  }, []);


  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
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
        login,
        logout,
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
