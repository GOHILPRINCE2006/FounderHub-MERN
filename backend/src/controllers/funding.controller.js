const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const FundingRequest = require("../models/FundingRequest");
const Startup = require("../models/Startup");
const InvestorConnection = require("../models/InvestorConnection");
const sendNotification = require("../utils/sendNotification");

// @route GET /api/v1/funding/eligible-investors
// @access Founder only
// Returns the investors the founder can send a funding request to:
// investors whose InvestorConnection to this founder's startup is Accepted.
const getEligibleInvestors = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You must create a startup before requesting funding");
  }

  const connections = await InvestorConnection.find({
    startup: startup._id,
    status: "Accepted",
  }).populate("investor", "name email avatar about company investmentFocus");

  const investors = connections
    .map((c) => c.investor)
    .filter(Boolean);

  return res
    .status(200)
    .json(new ApiResponse(200, investors, "Eligible investors fetched"));
});

// @route POST /api/v1/funding
// @access Founder only
const createFundingRequest = asyncHandler(async (req, res) => {
  const { investorId, amount, equityOffered, purpose, message } = req.body;

  if (!investorId || !amount || !equityOffered || !purpose) {
    throw new ApiError(400, "investorId, amount, equityOffered and purpose are required");
  }

  const numericAmount = Number(amount);
  const numericEquity = Number(equityOffered);

  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, "Amount must be a positive number");
  }
  if (Number.isNaN(numericEquity) || numericEquity <= 0 || numericEquity > 100) {
    throw new ApiError(400, "Equity must be between 0 and 100");
  }

  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You must create a startup before requesting funding");
  }

  // Confirm the investor previously accepted a connection to this startup.
  const connection = await InvestorConnection.findOne({
    startup: startup._id,
    investor: investorId,
    status: "Accepted",
  });
  if (!connection) {
    throw new ApiError(
      403,
      "You can only send funding requests to investors who have accepted your connection"
    );
  }

  // Prevent a duplicate open request to the same investor.
  const existing = await FundingRequest.findOne({
    startup: startup._id,
    founder: req.user._id,
    investor: investorId,
    status: "Pending",
  });
  if (existing) {
    throw new ApiError(409, "You already have a pending request to this investor");
  }

  const request = await FundingRequest.create({
    startup: startup._id,
    founder: req.user._id,
    investor: investorId,
    amount: numericAmount,
    equityOffered: numericEquity,
    purpose: purpose.trim(),
    message: (message || "").trim(),
  });

  await sendNotification(req, {
    recipient: investorId,
    type: "FUNDING_REQUEST_RECEIVED",
    message: `${req.user.name} requested ₹${numericAmount.toLocaleString("en-IN")} for "${startup.name}"`,
    link: "/investor/funding",
    relatedStartup: startup._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Funding request sent successfully"));
});

// @route GET /api/v1/funding/my-requests
// @access Founder only
const getMyFundingRequests = asyncHandler(async (req, res) => {
  const requests = await FundingRequest.find({ founder: req.user._id })
    .populate("investor", "name email avatar company investmentFocus")
    .populate("startup", "name logo industry stage")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Your funding requests fetched"));
});

// @route GET /api/v1/funding/received
// @access Investor only
const getReceivedFundingRequests = asyncHandler(async (req, res) => {
  const requests = await FundingRequest.find({ investor: req.user._id })
    .populate("founder", "name email avatar company")
    .populate("startup", "name logo industry stage tagline location")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Received funding requests fetched"));
});

// @route PUT /api/v1/funding/:id/accept
// @access Investor only (the one the request was sent to)
const acceptFundingRequest = asyncHandler(async (req, res) => {
  const request = await FundingRequest.findById(req.params.id).populate("startup");
  if (!request) {
    throw new ApiError(404, "Funding request not found");
  }

  if (request.investor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this request");
  }

  if (request.status !== "Pending") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Accepted";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.founder,
    type: "FUNDING_REQUEST_ACCEPTED",
    message: `${req.user.name} accepted your funding request for "${request.startup.name}"`,
    link: "/founder/funding",
    relatedStartup: request.startup._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Funding request accepted"));
});

// @route PUT /api/v1/funding/:id/decline
// @access Investor only (the one the request was sent to)
const declineFundingRequest = asyncHandler(async (req, res) => {
  const request = await FundingRequest.findById(req.params.id).populate("startup");
  if (!request) {
    throw new ApiError(404, "Funding request not found");
  }

  if (request.investor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this request");
  }

  if (request.status !== "Pending") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Declined";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.founder,
    type: "FUNDING_REQUEST_DECLINED",
    message: `${req.user.name} declined your funding request for "${request.startup.name}"`,
    link: "/founder/funding",
    relatedStartup: request.startup._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Funding request declined"));
});

module.exports = {
  getEligibleInvestors,
  createFundingRequest,
  getMyFundingRequests,
  getReceivedFundingRequests,
  acceptFundingRequest,
  declineFundingRequest,
};