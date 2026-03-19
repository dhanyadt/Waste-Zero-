import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";

let socket = null;
let lastAuthToken = null;
let lastUserId = null;

const getSocketServerUrl = () => {
  // The backend API is at e.g. http://localhost:5000/api
  // The Socket.IO server is expected at the same origin without the "/api" prefix.
  return API_BASE_URL.replace(/\/api\/?$/, "");
};

/**
 * Initializes and returns the shared Socket.IO instance.
 *
 * @param {Object} [options] - Optional socket.io-client options.
 * @param {string} [options.token] - Optional JWT token used for socket authentication.
 * @param {string} [options.userId] - Optional user ID for joining a user-specific room.
 * @returns {import("socket.io-client").Socket}
 */
export const connectSocket = ({ token, userId, ...options } = {}) => {
  const shouldReuse =
    socket &&
    socket.connected &&
    token &&
    token === lastAuthToken &&
    userId &&
    userId === lastUserId;

  // If already connected with the same token + userId, reuse the existing socket.
  if (shouldReuse) {
    if (userId) {
      socket.emit("joinRoom", { userId });
    }
    return socket;
  }

  // If we have an existing socket (with or without a token), disconnect first so we can reconnect cleanly.
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  lastAuthToken = token || null;
  lastUserId = userId || null;

  const url = getSocketServerUrl();
  const auth = { ...(options.auth || {}) };
  if (token) {
    auth.token = token;
  }

  socket = io(url, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
    ...options,
    auth,
  });

  const emitAuthAndJoin = () => {
    if (token) {
      socket.emit("authenticate", { token });
    }
    if (userId) {
      socket.emit("joinRoom", { userId });
    }
  };

  const log = (msg, ...args) => {
    // eslint-disable-next-line no-console
    console.debug("[socket.io]", msg, ...args);
  };

  socket.on("connect", () => {
    log("connected", socket.id);
    emitAuthAndJoin();
  });

  socket.on("disconnect", (reason) => {
    log("disconnected", reason);
  });

  socket.on("reconnect_attempt", (attempt) => {
    log("reconnect attempt", attempt);
  });

  socket.on("reconnect_error", (err) => {
    log("reconnect error", err);
  });

  socket.on("reconnect_failed", () => {
    log("reconnect failed");
  });

  socket.on("connect_error", (error) => {
    // eslint-disable-next-line no-console
    console.warn("Socket connection error:", error);
  });

  return socket;
};

/**
 * Returns the existing Socket.IO client instance (or null if not initialized).
 */
export const getSocket = () => socket;

/**
 * Disconnects the socket (if connected) and clears the reference.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    lastAuthToken = null;
    lastUserId = null;
  }
};
