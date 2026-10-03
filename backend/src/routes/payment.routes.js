const express = require("express");
const router = express.Router();

const {
  createMentorOrder,
  verifyMentorPayment,
  createInvestmentOrder,
  verifyInvestmentPayment,
} = require("../controllers/payment.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

// Mentor session payments — founder pays mentor
router.post("/mentor/create-order", protect, authorizeRoles("founder"), createMentorOrder);
router.post("/mentor/verify", protect, authorizeRoles("founder"), verifyMentorPayment);

// Investment payments — investor pays founder
router.post("/investment/create-order", protect, authorizeRoles("investor"), createInvestmentOrder);
router.post("/investment/verify", protect, authorizeRoles("investor"), verifyInvestmentPayment);

module.exports = router;