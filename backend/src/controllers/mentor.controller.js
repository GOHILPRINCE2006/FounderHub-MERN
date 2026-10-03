const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const MentorFeedback = require("../models/MentorFeedback");
const Startup = require("../models/Startup");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// Public fields shown to founders browsing mentors.
const MENTOR_PUBLIC_FIELDS =
  "name avatar skills about experience expertise yearsOfExperience currentRole company linkedin sessionPrice";

// Contact fields revealed only after a request is Paid.
const MENTOR_CONTACT_FIELDS = "email phone";
const FOUNDER_CONTACT_FIELDS = "email phone";

// @route GET /api/v1/mentors
// @access Public
// Verified mentors with the minimum trust signals filled in. sessionPrice
// must also be set — otherwise a founder can't book them.
const getVerifiedMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({
    role: "mentor",
    isVerified: true,
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
  const { mentorId, message } = req.body;

  if (!mentorId) {
    throw new ApiError(400, "mentorId is required");
  }

  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You must create a startup before requesting a mentor");
  }

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== "mentor") {
    throw new ApiError(404, "Mentor not found");
  }

  if (!mentor.isVerified) {
    throw new ApiError(403, "This mentor is not verified yet");
  }

  if (!mentor.sessionPrice || mentor.sessionPrice <= 0) {
    throw new ApiError(400, "This mentor has not set a session price yet");
  }

  // Only one open (Requested or Accepted) request per startup+mentor.
  const existing = await MentorFeedback.findOne({
    startup: startup._id,
    mentor: mentorId,
    status: { $in: ["Requested", "Accepted"] },
  });
  if (existing) {
    throw new ApiError(409, "You already have a pending request with this mentor");
  }

  const request = await MentorFeedback.create({
    startup: startup._id,
    mentor: mentorId,
    requestedBy: req.user._id,
    message: message || "",
    priceAtRequest: mentor.sessionPrice,
  });

  await sendNotification(req, {
    recipient: mentorId,
    type: "MENTOR_REQUEST_RECEIVED",
    message: `${req.user.name} requested a mentorship session for "${startup.name}"`,
    link: "/mentor/queue",
    relatedStartup: startup._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Mentor request sent"));
});

// @route GET /api/v1/mentors/queue
// @access Mentor only
// Requests sent to this mentor. Founder contact fields are only included
// once the request has been Paid.
const getMentorQueue = asyncHandler(async (req, res) => {
  if (req.user.role !== "mentor") {
    throw new ApiError(403, "Only mentors can access this");
  }

  const requests = await MentorFeedback.find({ mentor: req.user._id })
    .populate("startup", "name logo industry stage tagline problem solution")
    .populate("requestedBy", "name avatar email phone")
    .sort({ createdAt: -1 });

  // Strip contact fields on non-paid requests.
  const sanitized = requests.map((r) => {
    const obj = r.toObject();
    if (obj.status !== "Paid" && obj.requestedBy) {
      obj.requestedBy.email = undefined;
      obj.requestedBy.phone = undefined;
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

  if (request.status !== "Requested") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Accepted";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.requestedBy,
    type: "MENTOR_REQUEST_ACCEPTED",
    message: `${req.user.name} accepted your mentorship request — complete payment to confirm`,
    link: "/founder/mentors",
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

  if (request.status !== "Requested") {
    throw new ApiError(400, `Request has already been ${request.status.toLowerCase()}`);
  }

  request.status = "Declined";
  request.respondedAt = new Date();
  await request.save();

  await sendNotification(req, {
    recipient: request.requestedBy,
    type: "MENTOR_REQUEST_DECLINED",
    message: `${req.user.name} declined your mentorship request`,
    link: "/founder/mentors",
    relatedStartup: request.startup,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request declined"));
});

// @route GET /api/v1/mentors/my-requests
// @access Founder only
// All requests this founder has sent to any mentor.
const getMyMentorRequests = asyncHandler(async (req, res) => {
  const requests = await MentorFeedback.find({ requestedBy: req.user._id })
    .populate("mentor", MENTOR_PUBLIC_FIELDS)
    .populate("startup", "name logo industry stage")
    .sort({ createdAt: -1 });

  // Reveal mentor contact info only after payment.
  const sanitized = requests.map((r) => {
    const obj = r.toObject();
    if (obj.status === "Paid" && obj.mentor) {
      // re-fetch contact fields for the mentor
      // (populate above only got public fields; do a small second query)
    }
    return obj;
  });

  // Second pass to attach contact fields for paid requests.
  const paidMentorIds = sanitized
    .filter((r) => r.status === "Paid")
    .map((r) => r.mentor?._id)
    .filter(Boolean);

  if (paidMentorIds.length > 0) {
    const contacts = await User.find({ _id: { $in: paidMentorIds } })
      .select("email phone");
    const byId = new Map(contacts.map((c) => [c._id.toString(), c]));

    sanitized.forEach((r) => {
      if (r.status === "Paid" && r.mentor) {
        const c = byId.get(r.mentor._id.toString());
        if (c) {
          r.mentor.email = c.email;
          r.mentor.phone = c.phone;
        }
      }
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sanitized, "Your mentor requests"));
});

module.exports = {
  getVerifiedMentors,
  requestMentor,
  getMentorQueue,
  acceptMentorRequest,
  declineMentorRequest,
  getMyMentorRequests,
};