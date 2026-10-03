const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const InvestorConnection = require("../models/InvestorConnection");
const Startup = require("../models/Startup");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// Fields the founder sees when browsing investors.
const INVESTOR_PUBLIC_FIELDS =
  "name avatar about company investmentFocus ticketSize linkedin website";

// Contact fields unlocked once the request status is Accepted or Invested.
const CONTACT_FIELDS = "email phone";

// @route GET /api/v1/investors
// @access Public
// Verified investors that a founder can send a funding request to.
const getVerifiedInvestors = asyncHandler(async (req, res) => {
  const investors = await User.find({
    role: "investor",
    isVerified: true,
    company: { $nin: [null, ""] },
    investmentFocus: { $nin: [null, ""] },
  }).select(INVESTOR_PUBLIC_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, investors, "Verified investors fetched"));
});

// @route POST /api/v1/investors/request
// @access Founder only
// Body: { investorId, message, proposedAmount, proposedEquity }
const sendInvestmentRequest = asyncHandler(async (req, res) => {
  const { investorId, message, proposedAmount, proposedEquity } = req.body;

  if (!investorId || !proposedAmount || !proposedEquity) {
    throw new ApiError(400, "investorId, proposedAmount and proposedEquity are required");
  }

  const amount = Number(proposedAmount);
  const equity = Number(proposedEquity);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "proposedAmount must be a positive number");
  }
  if (Number.isNaN(equity) || equity <= 0 || equity > 100) {
    throw new ApiError(400, "proposedEquity must be between 0 and 100");
  }

  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You must create a startup before requesting funding");
  }

  const investor = await User.findById(investorId);
  if (!investor || investor.role !== "investor") {
    throw new ApiError(404, "Investor not found");
  }
  if (!investor.isVerified) {
    throw new ApiError(403, "This investor is not verified yet");
  }

  // One open request per (startup, investor). Once Invested/Declined/Withdrawn
  // the founder can send a new one.
  const existing = await InvestorConnection.findOne({
    startup: startup._id,
    investor: investorId,
    status: { $in: ["Requested", "Accepted"] },
  });
  if (existing) {
    throw new ApiError(409, "You already have a pending request with this investor");
  }

  const request = await InvestorConnection.create({
    startup: startup._id,
    founder: req.user._id,
    investor: investorId,
    message: message || "",
    proposedAmount: amount,
    proposedEquity: equity,
  });

  await sendNotification(req, {
    recipient: investorId,
    type: "INVESTMENT_REQUEST_RECEIVED",
    message: `${req.user.name} is seeking ₹${amount.toLocaleString("en-IN")} for "${startup.name}"`,
    link: "/investor/requests",
    relatedStartup: startup._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Investment request sent"));
});

// @route GET /api/v1/investors/my-requests
// @access Founder only
const getMyInvestmentRequests = asyncHandler(async (req, res) => {
  const requests = await InvestorConnection.find({ founder: req.user._id })
    .populate("investor", INVESTOR_PUBLIC_FIELDS)
    .populate("startup", "name logo industry stage")
    .sort({ createdAt: -1 });

  // Unlock investor contact once accepted/invested.
  const acceptedInvestorIds = requests
    .filter((r) => ["Accepted", "Invested"].includes(r.status))
    .map((r) => r.investor?._id)
    .filter(Boolean);

  if (acceptedInvestorIds.length > 0) {
    const contacts = await User.find({ _id: { $in: acceptedInvestorIds } }).select(
      CONTACT_FIELDS
    );
    const byId = new Map(contacts.map((c) => [c._id.toString(), c]));

    return res.status(200).json(
      new ApiResponse(
        200,
        requests.map((r) => {
          const obj = r.toObject();
          if (["Accepted", "Invested"].includes(obj.status) && obj.investor) {
            const c = byId.get(obj.investor._id.toString());
            if (c) {
              obj.investor.email = c.email;
              obj.investor.phone = c.phone;
            }
          }
          return obj;
        }),
        "Your investment requests"
      )
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Your investment requests"));
});

// @route GET /api/v1/investors/received
// @access Investor only
// Requests sent TO this investor.
const getReceivedInvestmentRequests = asyncHandler(async (req, res) => {
  const requests = await InvestorConnection.find({ investor: req.user._id })
    .populate("founder", "name avatar email phone")
    .populate(
      "startup",
      "name logo industry stage tagline location problem solution traction technologies teamSize fundingStatus"
    )
    .sort({ createdAt: -1 });

  // Hide founder contact until accepted/invested.
  const sanitized = requests.map((r) => {
    const obj = r.toObject();
    if (["Accepted", "Invested"].includes(obj.status)) return obj;
    if (obj.founder) {
      obj.founder.email = undefined;
      obj.founder.phone = undefined;
    }
    return obj;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, sanitized, "Investment requests received"));
});

// @route PUT /api/v1/investors/requests/:id/accept
// @access Investor only
const acceptInvestmentRequest = asyncHandler(async (req, res) => {
  const request = await InvestorConnection.findById(req.params.id).populate("startup");
  if (!request) throw new ApiError(404, "Request not found");

  if (request.investor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to respond");
  }
  if (request.status !== "Requested") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Accepted";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.founder,
    type: "INVESTMENT_REQUEST_ACCEPTED",
    message: `${req.user.name} accepted your funding request for "${request.startup.name}"`,
    link: "/founder/investors",
    relatedStartup: request.startup._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request accepted"));
});

// @route PUT /api/v1/investors/requests/:id/decline
// @access Investor only
const declineInvestmentRequest = asyncHandler(async (req, res) => {
  const request = await InvestorConnection.findById(req.params.id).populate("startup");
  if (!request) throw new ApiError(404, "Request not found");

  if (request.investor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to respond");
  }
  if (request.status !== "Requested") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Declined";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.founder,
    type: "INVESTMENT_REQUEST_DECLINED",
    message: `${req.user.name} declined your funding request for "${request.startup.name}"`,
    link: "/founder/investors",
    relatedStartup: request.startup._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request declined"));
});

// @route PUT /api/v1/investors/requests/:id/withdraw
// @access Founder only
const withdrawInvestmentRequest = asyncHandler(async (req, res) => {
  const request = await InvestorConnection.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  if (request.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to withdraw this request");
  }
  if (!["Requested", "Accepted"].includes(request.status)) {
    throw new ApiError(400, `Cannot withdraw a ${request.status.toLowerCase()} request`);
  }

  request.status = "Withdrawn";
  request.respondedAt = new Date();
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request withdrawn"));
});

module.exports = {
  getVerifiedInvestors,
  sendInvestmentRequest,
  getMyInvestmentRequests,
  getReceivedInvestmentRequests,
  acceptInvestmentRequest,
  declineInvestmentRequest,
  withdrawInvestmentRequest,
};