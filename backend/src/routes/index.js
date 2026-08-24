const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const startupRoutes = require("./startup.routes");
const recruitmentRoutes = require("./recruitment.routes");
const applicationRoutes = require("./application.routes");
const taskRoutes = require("./task.routes");
const messageRoutes = require("./message.routes");
const mentorRoutes = require("./mentor.routes");
const investorRoutes = require("./investor.routes");
const notificationRoutes = require("./notification.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/startups", startupRoutes);
router.use("/recruitments", recruitmentRoutes);
router.use("/applications", applicationRoutes);
router.use("/tasks", taskRoutes);
router.use("/messages", messageRoutes);
router.use("/mentors", mentorRoutes);
router.use("/investors", investorRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;