const express = require("express");
const router = express.Router();

const {
  getVerifiedInvestors,
  sendInvestmentRequest,
  getMyInvestmentRequests,
  getReceivedInvestmentRequests,
  acceptInvestmentRequest,
  declineInvestmentRequest,
  withdrawInvestmentRequest,
} = require("../controllers/investor.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/", getVerifiedInvestors);
router.post("/request", protect, authorizeRoles("founder"), sendInvestmentRequest);
router.get("/my-requests", protect, authorizeRoles("founder"), getMyInvestmentRequests);
router.get("/received", protect, authorizeRoles("investor"), getReceivedInvestmentRequests);
router.put("/requests/:id/accept", protect, authorizeRoles("investor"), acceptInvestmentRequest);
router.put("/requests/:id/decline", protect, authorizeRoles("investor"), declineInvestmentRequest);
router.put("/requests/:id/withdraw", protect, authorizeRoles("founder"), withdrawInvestmentRequest);

module.exports = router;