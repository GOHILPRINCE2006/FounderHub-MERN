const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const InvestorConnection = require("../models/InvestorConnection");
const Startup = require("../models/Startup");

// @route GET /api/v1/investors/startups/:id/team
// @access Public (browsing a startup's team is not gated behind a role;
// mirrors the existing public GET /api/v1/startups/:id detail view)
const getStartupTeam = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .populate("founder", "name email avatar skills about")
    .populate("teamMembers", "name email avatar skills about");

  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  const team = {
    founder: startup.founder,
    teamMembers: startup.teamMembers,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Startup team fetched successfully"));
});

// @route POST /api/v1/investors/connect
// @access Investor only
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { startupId, message } = req.body;

  if (!startupId) {
    throw new ApiError(400, "startupId is required");
  }

  const startup = await Startup.findById(startupId);
  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  const connectionRequest = await InvestorConnection.create({
    startup: startupId,
    investor: req.user._id,
    message: message || "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, connectionRequest, "Connection request sent successfully"));
});

// @route GET /api/v1/investors/my-requests
// @access Investor only
const getMyConnectionRequests = asyncHandler(async (req, res) => {
  const requests = await InvestorConnection.find({ investor: req.user._id })
    .populate("startup", "name logo industry stage description")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Your connection requests fetched successfully"));
});

// @route GET /api/v1/investors/received
// @access Founder only (owner of a startup)
const getReceivedConnectionRequests = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You have not created a startup yet");
  }

  const requests = await InvestorConnection.find({ startup: startup._id })
    .populate("investor", "name email avatar about")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Received connection requests fetched successfully"));
});

// @route PUT /api/v1/investors/:id/accept
// @access Founder only (owner of the startup the request was sent to)
const acceptConnectionRequest = asyncHandler(async (req, res) => {
  const connectionRequest = await InvestorConnection.findById(req.params.id).populate("startup");

  if (!connectionRequest) {
    throw new ApiError(404, "Connection request not found");
  }

  if (connectionRequest.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to manage this connection request");
  }

  if (connectionRequest.status !== "Pending") {
    throw new ApiError(400, `Request has already been ${connectionRequest.status.toLowerCase()}`);
  }

  connectionRequest.status = "Accepted";
  await connectionRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, connectionRequest, "Connection request accepted successfully"));
});

// @route PUT /api/v1/investors/:id/reject
// @access Founder only (owner of the startup the request was sent to)
const rejectConnectionRequest = asyncHandler(async (req, res) => {
  const connectionRequest = await InvestorConnection.findById(req.params.id).populate("startup");

  if (!connectionRequest) {
    throw new ApiError(404, "Connection request not found");
  }

  if (connectionRequest.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to manage this connection request");
  }

  if (connectionRequest.status !== "Pending") {
    throw new ApiError(400, `Request has already been ${connectionRequest.status.toLowerCase()}`);
  }

  connectionRequest.status = "Rejected";
  await connectionRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, connectionRequest, "Connection request rejected successfully"));
});

module.exports = {
  getStartupTeam,
  sendConnectionRequest,
  getMyConnectionRequests,
  getReceivedConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
};