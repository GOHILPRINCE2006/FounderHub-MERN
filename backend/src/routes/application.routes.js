const express = require("express");
const router = express.Router();

const {
  applyToPost,
  getApplicationsForPost,
  getMyApplications,
  acceptApplication,
  rejectApplication,
} = require("../controllers/application.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/:postId", protect, authorizeRoles("developer"), applyToPost);
router.get("/my-applications", protect, authorizeRoles("developer"), getMyApplications);
router.get("/post/:postId", protect, authorizeRoles("founder"), getApplicationsForPost);
router.put("/:id/accept", protect, authorizeRoles("founder"), acceptApplication);
router.put("/:id/reject", protect, authorizeRoles("founder"), rejectApplication);

module.exports = router;