import { Server } from "socket.io";

let io;
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    socket.on("user-join-room", (userId) => {
      socket.join(userId);
      console.log("👤 User joined room:", userId);
    });
    socket.on("admin-join-room", () => {
      socket.join("admins");
      console.log("🛡️ Admin joined room:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
