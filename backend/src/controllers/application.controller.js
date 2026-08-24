const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Application = require("../models/Application");
const RecruitmentPost = require("../models/RecruitmentPost");
const Startup = require("../models/Startup");
const sendNotification = require("../utils/sendNotification");

// @route POST /api/v1/applications/:postId
// @access Developer/Designer only
const applyToPost = asyncHandler(async (req, res) => {
  const { coverMessage } = req.body;
  const postId = req.params.postId;

  const post = await RecruitmentPost.findById(postId);
  if (!post) {
    throw new ApiError(404, "Recruitment post not found");
  }

  if (!post.isOpen) {
    throw new ApiError(400, "This recruitment post is closed");
  }

  // Check for existing application (any status) — one application per user per post, ever
  const existingApplication = await Application.findOne({
    recruitmentPost: postId,
    applicant: req.user._id,
  });

  if (existingApplication) {
    throw new ApiError(409, "You have already applied to this post");
  }

  let application;
  try {
    application = await Application.create({
      recruitmentPost: postId,
      startup: post.startup,
      applicant: req.user._id,
      coverMessage: coverMessage || "",
    });
  } catch (error) {
    // Catch DB-level unique index violation as a safety net
    if (error.code === 11000) {
      throw new ApiError(409, "You have already applied to this post");
    }
    throw error;
  }

  const startup = await Startup.findById(post.startup);
  if (startup) {
    await sendNotification(req, {
      recipient: startup.founder,
      type: "NEW_APPLICATION",
      message: `${req.user.name} applied to your "${post.roleTitle}" post`,
      link: `/startups/${startup._id}/applications`,
      relatedStartup: startup._id,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, application, "Application submitted successfully"));
});

// @route GET /api/v1/applications/post/:postId
// @access Founder only (owner of the startup)
const getApplicationsForPost = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.postId).populate("startup");

  if (!post) {
    throw new ApiError(404, "Recruitment post not found");
  }

  if (post.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view these applications");
  }

  const applications = await Application.find({ recruitmentPost: req.params.postId })
    .populate("applicant", "name email avatar skills")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, applications, "Applications fetched successfully"));
});

// @route GET /api/v1/applications/my-applications
// @access Developer/Designer only
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("startup", "name logo industry")
    .populate("recruitmentPost", "roleTitle")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, applications, "Your applications fetched successfully"));
});

// @route PUT /api/v1/applications/:id/accept
// @access Founder only (owner)
const acceptApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate("startup");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to manage this application");
  }

  if (application.status !== "Pending") {
    throw new ApiError(400, `Application has already been ${application.status.toLowerCase()}`);
  }

  application.status = "Accepted";
  await application.save();

  // Add applicant to startup's team members (avoid duplicates)
  await Startup.findByIdAndUpdate(application.startup._id, {
    $addToSet: { teamMembers: application.applicant },
  });

  await sendNotification(req, {
    recipient: application.applicant,
    type: "APPLICATION_ACCEPTED",
    message: `Your application to "${application.startup.name}" was accepted`,
    link: `/startups/${application.startup._id}`,
    relatedStartup: application.startup._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, application, "Application accepted successfully"));
});

// @route PUT /api/v1/applications/:id/reject
// @access Founder only (owner)
const rejectApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate("startup");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to manage this application");
  }

  if (application.status !== "Pending") {
    throw new ApiError(400, `Application has already been ${application.status.toLowerCase()}`);
  }

  application.status = "Rejected";
  await application.save();

  await sendNotification(req, {
    recipient: application.applicant,
    type: "APPLICATION_REJECTED",
    message: `Your application to "${application.startup.name}" was rejected`,
    link: `/startups/${application.startup._id}`,
    relatedStartup: application.startup._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, application, "Application rejected successfully"));
});

module.exports = {
  applyToPost,
  getApplicationsForPost,
  getMyApplications,
  acceptApplication,
  rejectApplication,
};