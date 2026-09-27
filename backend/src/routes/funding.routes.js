const express = require("express");
const router = express.Router();

const {
  getEligibleInvestors,
  createFundingRequest,
  getMyFundingRequests,
  getReceivedFundingRequests,
  acceptFundingRequest,
  declineFundingRequest,
} = require("../controllers/funding.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get(
  "/eligible-investors",
  protect,
  authorizeRoles("founder"),
  getEligibleInvestors
);

router.post("/", protect, authorizeRoles("founder"), createFundingRequest);

router.get(
  "/my-requests",
  protect,
  authorizeRoles("founder"),
  getMyFundingRequests
);

router.get(
  "/received",
  protect,
  authorizeRoles("investor"),
  getReceivedFundingRequests
);

router.put(
  "/:id/accept",
  protect,
  authorizeRoles("investor"),
  acceptFundingRequest
);

router.put(
  "/:id/decline",
  protect,
  authorizeRoles("investor"),
  declineFundingRequest
);

module.exports = router;