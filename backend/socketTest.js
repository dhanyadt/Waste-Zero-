const { io } = require("socket.io-client");

const socket = io("ws://localhost:5000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTk4OTM2NTRiMGU5NzNmYTJmNDhhM2EiLCJyb2xlIjoibmdvIiwiaWF0IjoxNzczNzY0OTM4LCJleHAiOjE3NzQzNjk3Mzh9.TFw7O_UE_m17CHdK80Wr_A5HdV4a14B0_jNXEx529l0",
  },
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Error:", err.message);
});

socket.on("newMessage", (data) => {
  console.log("📩 New Message:", data);
});

socket.on("notification", (data) => {
  console.log("🔔 Notification:", data);
});

setTimeout(() => {
  socket.emit("sendMessage", {
    receiverId: "69a56dd3db32afe3d81e584f",
    message: "Let's plan a collab",
  });
}, 3000);