const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAllStartupsAdmin,
  hideStartup,
  unhideStartup,
  deleteStartupAdmin,
  getPendingVerifications,
  approveVerification,
  revokeVerification,
  getPlatformStats,
} = require("../controllers/Admin.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

// Every route in this file is admin-only
router.use(protect, authorizeRoles("admin"));

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

// Startup moderation
router.get("/startups", getAllStartupsAdmin);
router.put("/startups/:id/hide", hideStartup);
router.put("/startups/:id/unhide", unhideStartup);
router.delete("/startups/:id", deleteStartupAdmin);

// Mentor / investor verification
router.get("/verifications", getPendingVerifications);
router.put("/verifications/:userId/approve", approveVerification);
router.put("/verifications/:userId/revoke", revokeVerification);

// Platform stats
router.get("/stats", getPlatformStats);

module.exports = router;