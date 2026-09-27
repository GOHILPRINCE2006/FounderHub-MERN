const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} = require("../controllers/notification.controller");

const protect = require("../middlewares/auth.middleware");

router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, markAllAsRead);
router.delete("/", protect, clearAllNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;