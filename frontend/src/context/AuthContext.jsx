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

  // Global conversations state — stays in sync across all pages
  const [conversations, setConversations] = useState([]);
  const conversationsLoadedRef = useRef(false);

  const messagesPageActiveRef = useRef(false);
  const matchesPageActiveRef = useRef(false);
  const lastMatchRef = useRef(null);
  const lastMessageRef = useRef(null);
  const lastNotificationRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearNotifications = () => setNotificationCount(0);
  const setMessagesPageActive = (active) => { messagesPageActiveRef.current = active; };
  const setMatchesPageActive = (active) => { matchesPageActiveRef.current = active; };

  // Fetch conversations once after login and expose via context
  const fetchConversations = async () => {
    try {
      const res = await API.get("/messages");
      setConversations(res.data.conversations || []);
      conversationsLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const initSocket = (token, userId) => {
    if (!token || socket) return;
    if (window.__socketInitialized) return;
    window.__socketInitialized = true;

    try {
      const socketInstance = connectSocket({ token, userId });
      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        lastMessageRef.current = null;
        lastMatchRef.current = null;
      });

      const handleNewMessage = (data) => {
        if (!data) return;
        const key = data._id ? String(data._id) : `${data.sender_id}-${data.createdAt}`;
        if (lastMessageRef.current === key) return;
        lastMessageRef.current = key;

        const senderId = data.sender_id || data.senderId;
        const senderName = data.senderName || "Someone";

        // Update global conversations list
        setConversations((prev) => {
          const exists = prev.find((c) => String(c.user._id) === String(senderId));
          if (exists) {
            return prev.map((c) =>
              String(c.user._id) === String(senderId)
                ? { ...c, lastMessage: data.content }
                : c
            );
          }
          return [{ user: { _id: senderId, name: senderName }, lastMessage: data.content }, ...prev];
        });

        // 1. Show Pop-up (Toast) if not on the messages page
        if (!messagesPageActiveRef.current) {
          showToast(`New message from ${senderName}`, "info");
          // 2. Increment Sidebar Badge
          setNotificationCount((prev) => Math.min(prev + 1, 50));
        }
      };

      const handleNewMatch = (match) => {
        if (!match) return;
        const key = JSON.stringify(match);
        if (lastMatchRef.current === key) return;
        lastMatchRef.current = key;
        showToast("New match received!", "success");
        if (matchesPageActiveRef.current) setMatches((prev) => [...prev, match]);
        setNotificationCount((prev) => prev + 1);
      };

      socketInstance.off("newMessage");
      socketInstance.off("newMatch");
      socketInstance.off("newNotification");

      socketInstance.on("newMessage", handleNewMessage);
      socketInstance.on("newMatch", handleNewMatch);
      socketInstance.on("newNotification", (data) => {
        if (!data) return;
        if (messagesPageActiveRef.current) return;
        showToast(data.message || "New message received", "info");
      });

    } catch (err) {
      console.error("Socket init failed:", err);
    }
  };

  useEffect(() => {
    // UPDATED: Use sessionStorage to prevent cross-tab overriding
    const savedToken = sessionStorage.getItem("token");
    if (!savedToken) { setLoading(false); return; }

    const fetchFreshUser = async () => {
      try {
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const freshUser = res.data.user || res.data;
        setUser(freshUser);
        
        // UPDATED: Save to sessionStorage
        sessionStorage.setItem("user", JSON.stringify(freshUser));
        
        initSocket(savedToken, freshUser?.id || freshUser?._id);
        fetchConversations();
      } catch (err) {
        console.error("Session restore failed:", err.message);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("dashboard");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    // UPDATED: Save to sessionStorage
    sessionStorage.setItem("user", JSON.stringify(userData));
    const token = sessionStorage.getItem("token");
    initSocket(token, userData?.id || userData?._id);
    fetchConversations();
  };

  const logout = () => {
    setUser(null);
    // UPDATED: Clear sessionStorage
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("dashboard");
    disconnectSocket();
    setSocket(null);
    window.__socketInitialized = false;
    setNotificationCount(0);
    setMatches([]);
    setConversations([]);
    conversationsLoadedRef.current = false;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, socket, notificationCount, matches,
      conversations, setConversations, fetchConversations,
      showToast, clearNotifications,
      setMessagesPageActive, setMatchesPageActive,
      updateUser, logout,
    }}>
      {children}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);