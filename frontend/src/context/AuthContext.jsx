import { createContext, useContext, useEffect, useRef, useState } from "react";
import API from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import Toast from "../components/ui/Toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [matches, setMatches] = useState([]);

  const messagesPageActiveRef = useRef(false);
  const matchesPageActiveRef = useRef(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const setMessagesPageActive = (active) => {
    messagesPageActiveRef.current = active;
  };

  const setMatchesPageActive = (active) => {
    matchesPageActiveRef.current = active;
  };

  const initSocket = (token, userId) => {
    if (!token) return;

    try {
      const socketInstance = connectSocket({ token, userId });
      setSocket(socketInstance);

      const handleNewMessage = () => {
        if (!messagesPageActiveRef.current) {
          setNotificationCount((prev) => prev + 1);
        }
      };

      const handleNewMatch = (match) => {
        showToast("New match received!", "success");
        if (matchesPageActiveRef.current) {
          setMatches((prev) => [...prev, match]);
        }
        setNotificationCount((prev) => prev + 1);
      };

      socketInstance.off("newMessage");
      socketInstance.off("newMatch");
      socketInstance.on("newMessage", handleNewMessage);
      socketInstance.on("newMatch", handleNewMatch);
    } catch (err) {
      // Socket connection should not block auth flow
      // eslint-disable-next-line no-console
      console.error("Socket init failed:", err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    // Always verify token + fetch fresh user from server on app load
    // This prevents stale role/data bugs from localStorage cache
    const fetchFreshUser = async () => {
      try {
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const freshUser = res.data.user || res.data;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser)); // keep in sync

        initSocket(savedToken, freshUser?.id || freshUser?._id);
      } catch (err) {
        // Token invalid or expired — clear everything
        console.error("Session restore failed:", err.message);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("dashboard"); // ← also clear dashboard choice
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    const token = localStorage.getItem("token");
    initSocket(token, userData?.id || userData?._id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("dashboard"); // ← clear on logout so next user starts fresh

    disconnectSocket();
    setSocket(null);
    setNotificationCount(0);
    setMatches([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        socket,
        notificationCount,
        matches,
        showToast,
        clearNotifications,
        setMessagesPageActive,
        setMatchesPageActive,
        updateUser,
        logout,
      }}
    >
      {children}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
