const express = require("express");
const router = express.Router();

const {
  getStartupTeam,
  sendConnectionRequest,
  getMyConnectionRequests,
  getReceivedConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
} = require("../controllers/investor.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/startups/:id/team", getStartupTeam);
router.post("/connect", protect, authorizeRoles("investor"), sendConnectionRequest);
router.get("/my-requests", protect, authorizeRoles("investor"), getMyConnectionRequests);
router.get("/received", protect, authorizeRoles("founder"), getReceivedConnectionRequests);
router.put("/:id/accept", protect, authorizeRoles("founder"), acceptConnectionRequest);
router.put("/:id/reject", protect, authorizeRoles("founder"), rejectConnectionRequest);

module.exports = router;