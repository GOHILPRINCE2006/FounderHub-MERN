const crypto = require("crypto");
const Razorpay = require("razorpay");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const MentorFeedback = require("../models/MentorFeedback");
const InvestorConnection = require("../models/InvestorConnection");
const Payment = require("../models/Payment");
const sendNotification = require("../utils/sendNotification");

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new ApiError(
      500,
      "Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env"
    );
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// =============== MENTOR PAYMENTS ===============

// @route POST /api/v1/payments/mentor/create-order
// @access Founder only
const createMentorOrder = asyncHandler(async (req, res) => {
  const { mentorRequestId } = req.body;
  if (!mentorRequestId) throw new ApiError(400, "mentorRequestId is required");

  const request = await MentorFeedback.findById(mentorRequestId).populate("mentor", "name");
  if (!request) throw new ApiError(404, "Request not found");
  if (request.requestedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to pay for this request");
  }
  if (request.status !== "Accepted") {
    throw new ApiError(400, `Cannot pay — status is "${request.status}"`);
  }
  if (!request.priceAtRequest || request.priceAtRequest <= 0) {
    throw new ApiError(400, "Request has no valid price");
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: request.priceAtRequest * 100,
    currency: "INR",
    receipt: `mreq_${request._id}`,
    notes: { mentorRequestId: request._id.toString() },
  });

  await Payment.create({
    paymentType: "mentor",
    payer: req.user._id,
    payee: request.mentor._id,
    amount: request.priceAtRequest,
    mentorRequest: request._id,
    razorpayOrderId: order.id,
    status: "Created",
  });

  return res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      mentorName: request.mentor.name,
    }, "Order created")
  );
});

// @route POST /api/v1/payments/mentor/verify
const verifyMentorPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay payload");
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, paymentType: "mentor" });
  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.payer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized for this payment");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    payment.status = "Failed";
    await payment.save();
    throw new ApiError(400, "Signature verification failed");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "Paid";
  await payment.save();

  const request = await MentorFeedback.findById(payment.mentorRequest);
  if (request && request.status === "Accepted") {
    request.status = "Paid";
    request.paidAt = new Date();
    await request.save();

    await sendNotification(req, {
      recipient: request.mentor,
      type: "MENTOR_REQUEST_PAID",
      message: `${req.user.name} paid for your mentorship session`,
      link: "/mentor/queue",
      relatedStartup: request.startup,
    });
  }

  return res.status(200).json(new ApiResponse(200, { success: true }, "Payment verified"));
});

// =============== INVESTMENT PAYMENTS ===============

// @route POST /api/v1/payments/investment/create-order
// @access Investor only
// Body: { investorConnectionId, amount, equityPercent }
const createInvestmentOrder = asyncHandler(async (req, res) => {
  const { investorConnectionId, amount, equityPercent } = req.body;
  if (!investorConnectionId || !amount || !equityPercent) {
    throw new ApiError(400, "investorConnectionId, amount and equityPercent are required");
  }

  const numericAmount = Number(amount);
  const numericEquity = Number(equityPercent);

  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, "Amount must be a positive number");
  }
  if (Number.isNaN(numericEquity) || numericEquity <= 0 || numericEquity > 100) {
    throw new ApiError(400, "Equity must be between 0 and 100");
  }

  const conn = await InvestorConnection.findById(investorConnectionId).populate("founder", "name");
  if (!conn) throw new ApiError(404, "Investment request not found");
  if (conn.investor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to pay for this request");
  }
  if (conn.status !== "Accepted") {
    throw new ApiError(400, `Cannot pay — status is "${conn.status}"`);
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: numericAmount * 100,
    currency: "INR",
    receipt: `inv_${conn._id}`,
    notes: { investorConnectionId: conn._id.toString() },
  });

  await Payment.create({
    paymentType: "investment",
    payer: req.user._id,
    payee: conn.founder._id,
    amount: numericAmount,
    investorConnection: conn._id,
    startup: conn.startup,
    equityPercent: numericEquity,
    razorpayOrderId: order.id,
    status: "Created",
  });

  return res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      founderName: conn.founder.name,
    }, "Order created")
  );
});

// @route POST /api/v1/payments/investment/verify
const verifyInvestmentPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay payload");
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    paymentType: "investment",
  });
  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.payer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized for this payment");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    payment.status = "Failed";
    await payment.save();
    throw new ApiError(400, "Signature verification failed");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "Paid";
  await payment.save();

  const conn = await InvestorConnection.findById(payment.investorConnection);
  if (conn && conn.status === "Accepted") {
    conn.status = "Invested";
    conn.finalAmount = payment.amount;
    conn.finalEquity = payment.equityPercent;
    conn.paidAt = new Date();
    await conn.save();

    await sendNotification(req, {
      recipient: conn.founder,
      type: "INVESTMENT_PAYMENT_RECEIVED",
      message: `${req.user.name} invested ₹${payment.amount.toLocaleString("en-IN")} in your startup`,
      link: "/founder/investors",
      relatedStartup: conn.startup,
    });
  }

  return res.status(200).json(new ApiResponse(200, { success: true }, "Payment verified"));
});

module.exports = {
  createMentorOrder,
  verifyMentorPayment,
  createInvestmentOrder,
  verifyInvestmentPayment,
};