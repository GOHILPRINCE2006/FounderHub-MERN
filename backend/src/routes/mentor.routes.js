const express = require("express");
const router = express.Router();

const {
  getVerifiedMentors,
  requestMentorFeedback,
  getMentorQueue,
  submitFeedback,
  getFeedbackForMyStartup,
} = require("../controllers/mentor.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/", getVerifiedMentors);
router.post("/request", protect, authorizeRoles("founder"), requestMentorFeedback);
router.get("/queue", protect, authorizeRoles("mentor"), getMentorQueue);
router.put("/feedback/:id", protect, authorizeRoles("mentor"), submitFeedback);
router.get("/received", protect, authorizeRoles("founder"), getFeedbackForMyStartup);

module.exports = router;