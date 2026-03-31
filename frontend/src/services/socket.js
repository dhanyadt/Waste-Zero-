import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";

let socket = null;
let lastAuthToken = null;
let lastUserId = null;

const getSocketServerUrl = () => {
  return API_BASE_URL.replace(/\/api\/?$/, "");
};

export const connectSocket = ({ token, userId, ...options } = {}) => {
  const shouldReuse =
    socket &&
    socket.connected &&
    token === lastAuthToken &&
    userId === lastUserId;

  if (shouldReuse) {
    if (userId) {
      socket.emit("register", userId); // 🔥 match backend
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  lastAuthToken = token || null;
  lastUserId = userId || null;

  const url = getSocketServerUrl();

  socket = io(url, {
    withCredentials: true,
    transports: ["websocket"], 
    reconnection: true,
    ...options,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);

    if (userId) {
      socket.emit("register", userId); 
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket error:", error);
  });

  return socket;
};

// ✅ export getter instead of undefined socket
export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    lastAuthToken = null;
    lastUserId = null;
  }
};