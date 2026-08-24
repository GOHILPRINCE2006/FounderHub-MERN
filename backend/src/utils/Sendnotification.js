const Notification = require("../models/Notification");

// Creates a Notification document and, if a socket is currently connected
// for that recipient, pushes it live via the "newNotification" event.
//
// Every authenticated socket auto-joins a room named after its own user id
// (see sockets/socket.js), so emitting to that room reaches only that user
// across all of their open tabs/devices.
//
// `req` is passed through so we can reach the io instance via
// req.app.get("io") (set once in server.js) — this keeps controllers from
// needing to import sockets/socket.js directly.
const sendNotification = async (req, { recipient, type, message, link, relatedStartup }) => {
  const notification = await Notification.create({
    recipient,
    type,
    message,
    link: link || "",
    relatedStartup: relatedStartup || null,
  });

  const io = req.app.get("io");
  if (io) {
    io.to(recipient.toString()).emit("newNotification", notification);
  }

  return notification;
};

module.exports = sendNotification;