const dotenv = require("dotenv");
dotenv.config();

const dns = require("dns");

// Optional: force public DNS for MongoDB Atlas SRV lookups on networks whose
// DNS blocks them. Off by default (cloud hosts don't need it).
if (process.env.USE_GOOGLE_DNS === "true") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket = require("./sockets/socket");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: app.allowedOrigins && app.allowedOrigins.length ? app.allowedOrigins : false,
    credentials: true,
  },
});

initializeSocket(io);

// Make io reachable from controllers via req.app.get("io"), so REST
// endpoints (applications, tasks, mentors, investors) can emit
// notification events without importing the sockets module directly.
app.set("io", io);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});