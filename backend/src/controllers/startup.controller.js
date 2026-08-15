const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Startup = require("../models/Startup");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @route POST /api/v1/startups
// @access Founder only
const createStartup = asyncHandler(async (req, res) => {
  const { name, description, industry, requiredSkills, requiredRoles, stage } = req.body;

  if (!name || !description || !industry) {
    throw new ApiError(400, "Name, description, and industry are required");
  }

  // Enforce one startup per founder (controller-level, not DB-level)
  const existingStartup = await Startup.findOne({ founder: req.user._id });
  if (existingStartup) {
    throw new ApiError(409, "You already have a startup. Only one startup per founder is allowed currently");
  }

  let logoUrl = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "foundrhub/startup-logos");
    logoUrl = result.secure_url;
  }

  const startup = await Startup.create({
    founder: req.user._id,
    name,
    description,
    industry,
    logo: logoUrl,
    requiredSkills: requiredSkills ? JSON.parse(requiredSkills) : [],
    requiredRoles: requiredRoles ? JSON.parse(requiredRoles) : [],
    stage: stage || "Idea",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, startup, "Startup created successfully"));
});

// @route PUT /api/v1/startups/:id
// @access Founder only (owner)
const updateStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);

  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this startup");
  }

  const allowedFields = ["name", "description", "industry", "stage"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      startup[field] = req.body[field];
    }
  });

  if (req.body.requiredSkills) {
    startup.requiredSkills = JSON.parse(req.body.requiredSkills);
  }
  if (req.body.requiredRoles) {
    startup.requiredRoles = JSON.parse(req.body.requiredRoles);
  }

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "foundrhub/startup-logos");
    startup.logo = result.secure_url;
  }

  await startup.save();

  return res
    .status(200)
    .json(new ApiResponse(200, startup, "Startup updated successfully"));
});

// @route DELETE /api/v1/startups/:id
// @access Founder only (owner)
const deleteStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);

  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this startup");
  }

  await startup.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Startup deleted successfully"));
});

// @route GET /api/v1/startups/:id
// @access Public
const getStartupById = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id).populate("founder", "name email avatar");

  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, startup, "Startup fetched successfully"));
});

// @route GET /api/v1/startups/my-startup
// @access Founder only
const getMyStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id });

  if (!startup) {
    throw new ApiError(404, "You have not created a startup yet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, startup, "Your startup fetched successfully"));
});

// @route GET /api/v1/startups
// @access Public
// Query params: keyword, skills, industry, stage, role
const getAllStartups = asyncHandler(async (req, res) => {
  const { keyword, skills, industry, stage, role } = req.query;

  const filter = { isModerated: true };

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  if (industry) {
    filter.industry = { $regex: industry, $options: "i" };
  }

  if (stage) {
    filter.stage = stage;
  }

  if (skills) {
    const skillsArray = skills.split(",").map((s) => s.trim());
    filter.requiredSkills = { $in: skillsArray };
  }

  if (role) {
    filter.requiredRoles = { $in: [role] };
  }

  const startups = await Startup.find(filter)
    .populate("founder", "name email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, startups, "Startups fetched successfully"));
});

module.exports = {
  createStartup,
  updateStartup,
  deleteStartup,
  getStartupById,
  getMyStartup,
  getAllStartups,
};