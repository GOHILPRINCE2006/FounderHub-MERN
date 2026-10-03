const express = require("express");
const router = express.Router();

const {
  getVerifiedMentors,
  requestMentor,
  getMentorQueue,
  acceptMentorRequest,
  declineMentorRequest,
  getMyMentorRequests,
} = require("../controllers/mentor.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/", getVerifiedMentors);
router.post("/request", protect, authorizeRoles("founder"), requestMentor);
router.get("/my-requests", protect, authorizeRoles("founder"), getMyMentorRequests);
router.get("/queue", protect, authorizeRoles("mentor"), getMentorQueue);
router.put("/requests/:id/accept", protect, authorizeRoles("mentor"), acceptMentorRequest);
router.put("/requests/:id/decline", protect, authorizeRoles("mentor"), declineMentorRequest);

module.exports = router;