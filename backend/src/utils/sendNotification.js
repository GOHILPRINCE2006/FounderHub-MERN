const Notification = require("../models/Notification");

// Creates a Notification document and, if a socket is currently connected
// for that recipient, pushes it live via the "newNotification" event.
//
// `req` is passed through so we can reach the io instance via
// req.app.get("io") (set once in server.js).
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
    // 1. Send the notification to the bell icon
    io.to(recipient.toString()).emit("newNotification", notification);
    
    // 2. Send a silent signal to tell the frontend to refetch its lists
    //    (This fixes the "Unknown User" bug and auto-updates lists)
    io.to(recipient.toString()).emit("dataUpdated");
  }

  return notification;
};

module.exports = sendNotification;