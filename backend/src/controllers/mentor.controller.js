const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const MentorFeedback = require("../models/MentorFeedback");
const Startup = require("../models/Startup");
const User = require("../models/User");

// @route GET /api/v1/mentors
// @access Public (founders browse verified mentors to select from)
const getVerifiedMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({ role: "mentor", isVerified: true }).select(
    "name email avatar skills about experience"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, mentors, "Verified mentors fetched successfully"));
});

// @route POST /api/v1/mentors/request
// @access Founder only (owner of a startup)
const requestMentorFeedback = asyncHandler(async (req, res) => {
  const { mentorId } = req.body;

  if (!mentorId) {
    throw new ApiError(400, "mentorId is required");
  }

  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You must create a startup before requesting mentor feedback");
  }

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== "mentor") {
    throw new ApiError(404, "Mentor not found");
  }

  if (!mentor.isVerified) {
    throw new ApiError(403, "This mentor is not verified yet");
  }

  const feedbackRequest = await MentorFeedback.create({
    startup: startup._id,
    mentor: mentorId,
    requestedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, feedbackRequest, "Mentor feedback requested successfully"));
});

// @route GET /api/v1/mentors/queue
// @access Mentor only (verified)
const getMentorQueue = asyncHandler(async (req, res) => {
  if (req.user.role !== "mentor") {
    throw new ApiError(403, "Only mentors can access this");
  }

  const requests = await MentorFeedback.find({ mentor: req.user._id })
    .populate("startup", "name logo industry stage description")
    .populate("requestedBy", "name email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Mentor queue fetched successfully"));
});

// @route PUT /api/v1/mentors/feedback/:id
// @access Mentor only (assigned to that request)
const submitFeedback = asyncHandler(async (req, res) => {
  const { feedbackText } = req.body;

  if (!feedbackText || !feedbackText.trim()) {
    throw new ApiError(400, "Feedback text is required");
  }

  const feedbackRequest = await MentorFeedback.findById(req.params.id);
  if (!feedbackRequest) {
    throw new ApiError(404, "Feedback request not found");
  }

  if (feedbackRequest.mentor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to submit feedback for this request");
  }

  feedbackRequest.feedbackText = feedbackText.trim();
  feedbackRequest.status = "Reviewed";
  await feedbackRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, feedbackRequest, "Feedback submitted successfully"));
});

// @route GET /api/v1/mentors/received
// @access Founder only (owner of a startup)
const getFeedbackForMyStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You have not created a startup yet");
  }

  const feedbackList = await MentorFeedback.find({ startup: startup._id })
    .populate("mentor", "name email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, feedbackList, "Mentor feedback fetched successfully"));
});

module.exports = {
  getVerifiedMentors,
  requestMentorFeedback,
  getMentorQueue,
  submitFeedback,
  getFeedbackForMyStartup,
};