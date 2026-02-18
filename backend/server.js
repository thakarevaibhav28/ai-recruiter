import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";
connectDB();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
initSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
