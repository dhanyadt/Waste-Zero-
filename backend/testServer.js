const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();

const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket"],
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);
});

server.listen(5000, () => {
  console.log("🚀 Test server running on port 5000");
});