const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Notification = require("../models/Notification");

// @route GET /api/v1/notifications
// @access Any authenticated user (own notifications only)
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("relatedStartup", "name logo")
    .sort({ createdAt: -1 });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return res
    .status(200)
    .json(
      new ApiResponse(200, { notifications, unreadCount }, "Notifications fetched successfully")
    );
});

// @route PUT /api/v1/notifications/:id/read
// @access Owner (recipient) only
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this notification");
  }

  notification.isRead = true;
  await notification.save();

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

// @route PUT /api/v1/notifications/read-all
// @access Any authenticated user (own notifications only)
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};