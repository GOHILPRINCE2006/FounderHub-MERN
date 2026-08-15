const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasksForStartup,
  getMyTasks,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/task.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/", protect, authorizeRoles("founder"), createTask);
router.get("/my-tasks", protect, getMyTasks);
router.get("/startup/:startupId", protect, getTasksForStartup);
router.put("/:id/status", protect, updateTaskStatus);
router.delete("/:id", protect, authorizeRoles("founder"), deleteTask);

module.exports = router;