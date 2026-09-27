const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Startup = require("../models/Startup");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { canViewPrivate } = require("../utils/checkStartupAccess");

// Fields that are safe to return to anyone.
const PUBLIC_FIELDS = [
  "_id", "name", "tagline", "industry", "logo", "location", "website",
  "requiredSkills", "requiredRoles", "lookingFor", "stage",
  "founder", "teamMembers", "isModerated", "createdAt", "updatedAt",
];

// Fields returned ONLY when the viewer is authorized.
const PRIVATE_FIELDS = [
  "problem", "solution", "teamSize", "foundingYear",
  "fundingStatus", "traction", "technologies",
];

const toPublic = (startup) => {
  const obj = startup.toObject ? startup.toObject() : { ...startup };
  PRIVATE_FIELDS.forEach((f) => delete obj[f]);
  return obj;
};

const toFull = (startup) => {
  const obj = startup.toObject ? startup.toObject() : { ...startup };
  return obj;
};

// @route POST /api/v1/startups
const createStartup = asyncHandler(async (req, res) => {
  const {
    name, tagline, industry, location, website,
    requiredSkills, requiredRoles, lookingFor, stage,
    problem, solution, teamSize, foundingYear, fundingStatus,
    traction, technologies,
  } = req.body;

  if (!name || !tagline || !industry) {
    throw new ApiError(400, "Name, tagline, and industry are required");
  }

  const existingStartup = await Startup.findOne({ founder: req.user._id });
  if (existingStartup) {
    throw new ApiError(409, "You already have a startup. Only one startup per founder is allowed.");
  }

  let logoUrl = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "foundrhub/startup-logos");
    logoUrl = result.secure_url;
  }

  const parseArr = (v) => {
    if (!v) return [];
    try { return JSON.parse(v); } catch { return []; }
  };

  const startup = await Startup.create({
    founder: req.user._id,
    name,
    tagline,
    industry,
    logo: logoUrl,
    location: location || "",
    website: website || "",
    requiredSkills: parseArr(requiredSkills),
    requiredRoles: parseArr(requiredRoles),
    lookingFor: parseArr(lookingFor),
    stage: stage || "Idea",
    problem: problem || "",
    solution: solution || "",
    teamSize: teamSize ? Number(teamSize) : 1,
    foundingYear: foundingYear ? Number(foundingYear) : null,
    fundingStatus: fundingStatus || "",
    traction: traction || "",
    technologies: parseArr(technologies),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, startup, "Startup created successfully"));
});

// @route PUT /api/v1/startups/:id
const updateStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) throw new ApiError(404, "Startup not found");
  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this startup");
  }

  const simpleFields = [
    "name", "tagline", "industry", "stage", "location", "website",
    "problem", "solution", "fundingStatus", "traction",
  ];
  simpleFields.forEach((f) => {
    if (req.body[f] !== undefined) startup[f] = req.body[f];
  });

  if (req.body.teamSize !== undefined && req.body.teamSize !== "") {
    startup.teamSize = Number(req.body.teamSize);
  }
  if (req.body.foundingYear !== undefined && req.body.foundingYear !== "") {
    startup.foundingYear = Number(req.body.foundingYear);
  }

  const parseArr = (v) => {
    if (!v) return [];
    try { return JSON.parse(v); } catch { return []; }
  };
  if (req.body.requiredSkills) startup.requiredSkills = parseArr(req.body.requiredSkills);
  if (req.body.requiredRoles) startup.requiredRoles = parseArr(req.body.requiredRoles);
  if (req.body.lookingFor) startup.lookingFor = parseArr(req.body.lookingFor);
  if (req.body.technologies) startup.technologies = parseArr(req.body.technologies);

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
const deleteStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) throw new ApiError(404, "Startup not found");
  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this startup");
  }
  await startup.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Startup deleted successfully"));
});

// @route GET /api/v1/startups/:id
const getStartupById = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .populate("founder", "name email avatar")
    .populate("teamMembers", "name email avatar skills");

  if (!startup) throw new ApiError(404, "Startup not found");

  if (!startup.isModerated) {
    const isAdmin = req.user && req.user.role === "admin";
    const isOwner = req.user && startup.founder._id.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      throw new ApiError(404, "Startup not found");
    }
  }

  const allowed = await canViewPrivate(startup, req.user?._id, req.user?.role);
  const payload = allowed ? toFull(startup) : toPublic(startup);

  return res
    .status(200)
    .json(new ApiResponse(200, { ...payload, canViewPrivate: allowed }, "Startup fetched successfully"));
});

// @route GET /api/v1/startups/my-startup
const getMyStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user._id }).populate(
    "teamMembers",
    "name email avatar"
  );
  if (!startup) throw new ApiError(404, "You have not created a startup yet");
  return res
    .status(200)
    .json(new ApiResponse(200, toFull(startup), "Your startup fetched successfully"));
});

// @route GET /api/v1/startups/my-teams
const getMyTeams = asyncHandler(async (req, res) => {
  const startups = await Startup.find({
    $or: [{ founder: req.user._id }, { teamMembers: req.user._id }],
  })
    .select("name logo founder tagline industry stage")
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, startups, "Your teams fetched successfully"));
});

// @route GET /api/v1/startups
const getAllStartups = asyncHandler(async (req, res) => {
  const { keyword, skills, industry, stage, role } = req.query;
  const filter = { isModerated: true };

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { tagline: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }
  if (industry) filter.industry = { $regex: industry, $options: "i" };
  if (stage) filter.stage = stage;
  if (skills) {
    const skillsArray = skills.split(",").map((s) => s.trim());
    filter.requiredSkills = { $in: skillsArray };
  }
  if (role) filter.requiredRoles = { $in: [role] };

  const startups = await Startup.find(filter)
    .populate("founder", "name email avatar")
    .sort({ createdAt: -1 });

  // List view is always public — no private fields ever returned here.
  const payload = startups.map(toPublic);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Startups fetched successfully"));
});

module.exports = {
  createStartup,
  updateStartup,
  deleteStartup,
  getStartupById,
  getMyStartup,
  getMyTeams,
  getAllStartups,
};