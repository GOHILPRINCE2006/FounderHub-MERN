const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const RecruitmentPost = require("../models/RecruitmentPost");
const Startup = require("../models/Startup");

// @route POST /api/v1/recruitments
// @access Founder only
const createRecruitmentPost = asyncHandler(async (req, res) => {
  const { startupId, roleTitle, requiredSkills, description } = req.body;

  if (!startupId || !roleTitle || !description) {
    throw new ApiError(400, "startupId, role title and description are required");
  }

  const startup = await Startup.findById(startupId);
  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  // Authorization check: Is the current user the actual founder of this startup?
  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to post for this startup");
  }

  const post = await RecruitmentPost.create({
    startup: startup._id,
    roleTitle,
    requiredSkills: requiredSkills || [],
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Recruitment post created successfully"));
});

// @route GET /api/v1/recruitments/my-posts
// @access Founder only
// Returns posts across ALL startups owned by the founder.
const getMyRecruitmentPosts = asyncHandler(async (req, res) => {
  // Get all startups owned by this founder
  const startups = await Startup.find({ founder: req.user._id }).select("_id");
  const startupIds = startups.map((s) => s._id);

  // Find posts that belong to any of those startups
  const posts = await RecruitmentPost.find({ startup: { $in: startupIds } })
    .populate("startup", "name logo")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Your recruitment posts fetched successfully"));
});

// @route GET /api/v1/recruitments
const getAllRecruitmentPosts = asyncHandler(async (req, res) => {
  // Only posts of visible (non-moderated-away) startups are public
  const visible = await Startup.find({ isModerated: true }).select("_id");
  const posts = await RecruitmentPost.find({
    isOpen: true,
    startup: { $in: visible.map((s) => s._id) },
  })
    .populate("startup", "name logo industry stage")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Recruitment posts fetched successfully"));
});

// @route GET /api/v1/recruitments/:id
const getRecruitmentPostById = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.id).populate(
    "startup",
    "name logo industry stage description"
  );
  if (!post) throw new ApiError(404, "Recruitment post not found");
  return res.status(200).json(new ApiResponse(200, post, "Recruitment post fetched"));
});

// @route PUT /api/v1/recruitments/:id
const updateRecruitmentPost = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.id).populate("startup");
  if (!post) throw new ApiError(404, "Recruitment post not found");

  if (post.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this post");
  }

  const allowedFields = ["roleTitle", "requiredSkills", "description", "isOpen"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) post[field] = req.body[field];
  });

  await post.save();
  return res.status(200).json(new ApiResponse(200, post, "Post updated"));
});

// @route DELETE /api/v1/recruitments/:id
const deleteRecruitmentPost = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.id).populate("startup");
  if (!post) throw new ApiError(404, "Recruitment post not found");

  if (post.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await post.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Post deleted"));
});

module.exports = {
  createRecruitmentPost,
  getAllRecruitmentPosts,
  getRecruitmentPostById,
  getMyRecruitmentPosts,
  updateRecruitmentPost,
  deleteRecruitmentPost,
};