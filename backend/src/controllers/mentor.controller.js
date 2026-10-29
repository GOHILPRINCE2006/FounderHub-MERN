const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const MentorFeedback = require("../models/MentorFeedback");
const Startup = require("../models/Startup");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// Public fields shown to founders browsing mentors.
const MENTOR_PUBLIC_FIELDS =
  "name avatar skills about experience expertise yearsOfExperience currentRole company linkedin sessionPrice isAcceptingRequests languages mentorshipFormat isVerified";

// @route GET /api/v1/mentors
// @access Public
// Verified mentors with the minimum trust signals filled in.
const getVerifiedMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({
    role: "mentor",
    isVerified: true,
    isAcceptingRequests: true, // Added to hide paused mentors
    currentRole: { $nin: [null, ""] },
    company: { $nin: [null, ""] },
    expertise: { $nin: [null, ""] },
    sessionPrice: { $gt: 0 },
  }).select(MENTOR_PUBLIC_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, mentors, "Verified mentors fetched successfully"));
});

// @route POST /api/v1/mentors/request
// @access Founder only
const requestMentor = asyncHandler(async (req, res) => {
  const { mentorId, message, startupId, challenge, goals, preferredFormat } = req.body;

  if (!mentorId || !startupId || !challenge || !goals) {
    throw new ApiError(400, "mentorId, startupId, challenge, and goals are required");
  }

  const startup = await Startup.findById(startupId);
  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to request a mentor for this startup");
  }

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== "mentor") throw new ApiError(404, "Mentor not found");
  if (!mentor.isVerified) throw new ApiError(403, "This mentor is not verified yet");
  if (!mentor.isAcceptingRequests) throw new ApiError(400, "This mentor is not accepting new requests");
  if (!mentor.sessionPrice || mentor.sessionPrice <= 0) {
    throw new ApiError(400, "This mentor has not set a session price yet");
  }

  // Check for an active request. We only block if it's Pending or Accepted AND 
  // the session isn't finished yet.
  const existing = await MentorFeedback.findOne({
    startup: startup._id,
    mentor: mentorId,
    status: { $in: ["Pending", "Accepted"] },
    sessionStatus: { $ne: "Completed" }, // <--- ADD THIS LINE
  });
  
  if (existing) {
    throw new ApiError(409, "You already have a pending or active request with this mentor for this startup");
  }

  const request = await MentorFeedback.create({
    startup: startup._id,
    founder: req.user._id, // Explicitly mapping founder
    mentor: mentorId,
    challenge,
    goals,
    message: message || "",
    preferredFormat: preferredFormat || "1-on-1",
    priceAtRequest: mentor.sessionPrice,
    status: "Pending",
  });

  await sendNotification(req, {
    recipient: mentorId,
    type: "MENTOR_REQUEST_RECEIVED",
    message: `${req.user.name} requested a session for "${startup.name}"`,
    link: "/mentor/queue",
    relatedStartup: startup._id,
  });

  return res.status(201).json(new ApiResponse(201, request, "Mentor request sent"));
});

// @route GET /api/v1/mentors/queue
// @access Mentor only
const getMentorQueue = asyncHandler(async (req, res) => {
  if (req.user.role !== "mentor") {
    throw new ApiError(403, "Only mentors can access this");
  }

  const requests = await MentorFeedback.find({ mentor: req.user._id })
    .populate("startup", "name logo industry stage tagline problem solution")
    .populate("founder", "name avatar email phone")
    .sort({ createdAt: -1 });

  // Strip contact fields on non-accepted/non-paid requests.
  const sanitized = requests.map((r) => {
    const obj = r.toObject();
    const isFullyAccepted = obj.status === "Accepted" && obj.paymentStatus === "Paid";
    
    if (!isFullyAccepted && obj.founder) {
      obj.founder.email = undefined;
      obj.founder.phone = undefined;
    }
    return obj;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, sanitized, "Mentor queue fetched"));
});

// @route PUT /api/v1/mentors/requests/:id/accept
// @access Mentor only (owner of the request)
const acceptMentorRequest = asyncHandler(async (req, res) => {
  const request = await MentorFeedback.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  if (request.mentor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this request");
  }

  if (request.status !== "Pending") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Accepted";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.founder, // Using 'founder' field instead of 'requestedBy'
    type: "MENTOR_REQUEST_ACCEPTED",
    message: `${req.user.name} accepted your mentorship request — complete payment to confirm`,
    link: `/founder/mentors`,
    relatedStartup: request.startup,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request accepted"));
});

// @route PUT /api/v1/mentors/requests/:id/decline
// @access Mentor only (owner of the request)
const declineMentorRequest = asyncHandler(async (req, res) => {
  const request = await MentorFeedback.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  if (request.mentor.toString() !== req.user._id.toString()) {
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
    type: "MENTOR_REQUEST_DECLINED",
    message: `${req.user.name} declined your mentorship request`,
    link: `/founder/mentors`,
    relatedStartup: request.startup,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request declined"));
});

// @route GET /api/v1/mentors/my-requests
// @access Founder only
const getMyMentorRequests = asyncHandler(async (req, res) => {
  const requests = await MentorFeedback.find({ founder: req.user._id })
    .populate("mentor", MENTOR_PUBLIC_FIELDS)
    .populate("startup", "name logo industry stage")
    .sort({ createdAt: -1 });

  // Reveal mentor contact info only after payment.
  const paidMentorIds = requests
    .filter((r) => r.paymentStatus === "Paid")
    .map((r) => r.mentor?._id)
    .filter(Boolean);

  if (paidMentorIds.length > 0) {
    const contacts = await User.find({ _id: { $in: paidMentorIds } }).select("email phone");
    const byId = new Map(contacts.map((c) => [c._id.toString(), c]));

    requests.forEach((r) => {
      if (r.paymentStatus === "Paid" && r.mentor) {
        const c = byId.get(r.mentor._id.toString());
        if (c) {
          // We have to mutate the populated document
          r.mentor.email = c.email;
          r.mentor.phone = c.phone;
        }
      }
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Your mentor requests"));
});

// @route PUT /api/v1/mentors/requests/:id/complete
// @access Mentor only
const completeMentorSession = asyncHandler(async (req, res) => {
  const request = await MentorFeedback.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");

  if (request.mentor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this request");
  }

  if (request.paymentStatus !== "Paid") {
    throw new ApiError(400, "Cannot complete a session that hasn't been paid for");
  }

  if (request.sessionStatus === "Completed") {
    throw new ApiError(400, "This session is already marked as completed");
  }

  request.sessionStatus = "Completed";
  await request.save();

  await sendNotification(req, {
    recipient: request.founder,
    type: "MENTOR_SESSION_COMPLETED",
    message: `${req.user.name} marked your mentorship session as completed. You can now leave a review or book again!`,
    link: "/founder/mentors",
    relatedStartup: request.startup,
  });

  return res.status(200).json(new ApiResponse(200, request, "Session marked as completed"));
});

module.exports = {
  getVerifiedMentors,
  requestMentor,
  getMentorQueue,
  acceptMentorRequest,
  declineMentorRequest,
  getMyMentorRequests,
  completeMentorSession,
};