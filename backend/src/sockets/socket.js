const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const User = require("../models/User");
const Startup = require("../models/Startup");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const initializeSocket = (io) => {
  // Middleware: authenticate every socket connection using the JWT cookie
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) {
        return next(new Error("Not authorized, no token found"));
      }

      const parsedCookies = cookie.parse(rawCookie);
      const token = parsedCookies.token;

      if (!token) {
        return next(new Error("Not authorized, no token found"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error("Not authorized"));
      }

      socket.user = user; // attach user to socket for use in event handlers
      next();
    } catch (error) {
      next(new Error("Not authorized, token invalid or expired"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Auto-join a personal room (named after the user's own id) so
    // REST controllers can push targeted notifications to this user via
    // io.to(userId).emit("newNotification", ...) regardless of which
    // startup room(s) they're in.
    socket.join(socket.user._id.toString());

    // Join a startup's team chat room (only if authorized)
    socket.on("joinStartupRoom", async (startupId) => {
      try {
        const startup = await Startup.findById(startupId);
        if (!startup) {
          return socket.emit("errorMessage", "Startup not found");
        }

        const isFounder = startup.founder.toString() === socket.user._id.toString();
        const isTeamMember = startup.teamMembers.some(
          (m) => m.toString() === socket.user._id.toString()
        );

        if (!isFounder && !isTeamMember) {
          return socket.emit("errorMessage", "You are not authorized to join this chat");
        }

        socket.join(startupId);
        socket.emit("joinedRoom", startupId);
      } catch (error) {
        socket.emit("errorMessage", "Failed to join room");
      }
    });

    // Send a message to the startup's team room
    socket.on("sendMessage", async ({ startupId, content }) => {
      try {
        if (!content || !content.trim()) {
          return socket.emit("errorMessage", "Message cannot be empty");
        }

        const startup = await Startup.findById(startupId);
        if (!startup) {
          return socket.emit("errorMessage", "Startup not found");
        }

        const isFounder = startup.founder.toString() === socket.user._id.toString();
        const isTeamMember = startup.teamMembers.some(
          (m) => m.toString() === socket.user._id.toString()
        );

        if (!isFounder && !isTeamMember) {
          return socket.emit("errorMessage", "You are not authorized to send messages here");
        }

        // Find or create the conversation for this startup
        let conversation = await Conversation.findOne({ startup: startupId });
        if (!conversation) {
          conversation = await Conversation.create({ startup: startupId });
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          content: content.trim(),
        });

        const populatedMessage = await message.populate("sender", "name avatar");

        // Broadcast to everyone in the room, including sender
        io.to(startupId).emit("newMessage", populatedMessage);
      } catch (error) {
        socket.emit("errorMessage", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};

module.exports = initializeSocket;