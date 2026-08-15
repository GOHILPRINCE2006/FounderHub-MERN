const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const RecruitmentPost = require("../models/RecruitmentPost");
const Startup = require("../models/Startup");

// @route POST /api/v1/recruitments
// @access Founder only (owner of a startup)
const createRecruitmentPost = asyncHandler(async (req, res) => {
  const { roleTitle, requiredSkills, description } = req.body;

  if (!roleTitle || !description) {
    throw new ApiError(400, "Role title and description are required");
  }

  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You must create a startup before posting recruitment");
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

// @route GET /api/v1/recruitments
// @access Public (developers/designers browse open posts)
const getAllRecruitmentPosts = asyncHandler(async (req, res) => {
  const posts = await RecruitmentPost.find({ isOpen: true })
    .populate("startup", "name logo industry stage")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Recruitment posts fetched successfully"));
});

// @route GET /api/v1/recruitments/:id
// @access Public
const getRecruitmentPostById = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.id).populate(
    "startup",
    "name logo industry stage description"
  );

  if (!post) {
    throw new ApiError(404, "Recruitment post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Recruitment post fetched successfully"));
});

// @route GET /api/v1/recruitments/my-posts
// @access Founder only
const getMyRecruitmentPosts = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id });
  if (!startup) {
    throw new ApiError(404, "You have not created a startup yet");
  }

  const posts = await RecruitmentPost.find({ startup: startup._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Your recruitment posts fetched successfully"));
});

// @route PUT /api/v1/recruitments/:id
// @access Founder only (owner)
const updateRecruitmentPost = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.id).populate("startup");

  if (!post) {
    throw new ApiError(404, "Recruitment post not found");
  }

  if (post.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this post");
  }

  const allowedFields = ["roleTitle", "requiredSkills", "description", "isOpen"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });

  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Recruitment post updated successfully"));
});

// @route DELETE /api/v1/recruitments/:id
// @access Founder only (owner)
const deleteRecruitmentPost = asyncHandler(async (req, res) => {
  const post = await RecruitmentPost.findById(req.params.id).populate("startup");

  if (!post) {
    throw new ApiError(404, "Recruitment post not found");
  }

  if (post.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await post.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Recruitment post deleted successfully"));
});

module.exports = {
  createRecruitmentPost,
  getAllRecruitmentPosts,
  getRecruitmentPostById,
  getMyRecruitmentPosts,
  updateRecruitmentPost,
  deleteRecruitmentPost,
};