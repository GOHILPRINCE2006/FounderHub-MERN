const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Startup = require("../models/Startup");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { canViewPrivate } = require("../utils/checkStartupAccess");
const { deleteStartupCascade } = require("../utils/cascadeDelete");

const escapeRegex = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PUBLIC_FIELDS = [
  "_id", "name", "tagline", "industry", "logo", "location", "website",
  "requiredSkills", "requiredRoles", "lookingFor", "stage",
  "founder", "teamMembers", "isModerated", "createdAt", "updatedAt",
];

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

// @route GET /api/v1/startups/my-startups
// @access Founder only
// Returns ALL startups this founder owns. Replaces the old /my-startup route.
const getMyStartups = asyncHandler(async (req, res) => {
  const startups = await Startup.find({ founder: req.user._id })
    .populate("teamMembers", "name email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, startups, "Your startups fetched successfully"));
});

// @route POST /api/v1/startups
// @access Founder only
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

  let logoUrl = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "foundrhub/startup-logos");
    logoUrl = result.secure_url;
  }

  const parseArr = (v) => {
    if (!v) return [];
    try { return JSON.parse(v); } catch { return []; }
  };

  // REMOVED the check that prevented multiple startups.
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
// @access Founder only (owner)
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
// @access Founder only (owner)
const deleteStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) throw new ApiError(404, "Startup not found");
  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this startup");
  }
  await deleteStartupCascade(startup._id);
  return res.status(200).json(new ApiResponse(200, {}, "Startup deleted successfully"));
});

// @route GET /api/v1/startups/:id
// @access Public / Optional Auth
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

  if (typeof keyword === "string" && keyword.trim()) {
    const kw = escapeRegex(keyword.trim());
    filter.$or = [
      { name: { $regex: kw, $options: "i" } },
      { tagline: { $regex: kw, $options: "i" } },
      { description: { $regex: kw, $options: "i" } },
    ];
  }
  if (typeof industry === "string" && industry.trim()) {
    filter.industry = { $regex: escapeRegex(industry.trim()), $options: "i" };
  }
  if (typeof stage === "string" && stage) filter.stage = stage;
  if (typeof skills === "string" && skills.trim()) {
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (skillsArray.length) filter.requiredSkills = { $in: skillsArray };
  }
  if (typeof role === "string" && role) filter.requiredRoles = { $in: [role] };

  const startups = await Startup.find(filter)
    .populate("founder", "name email avatar")
    .sort({ createdAt: -1 });

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
  getMyStartups, // <-- Updated export
  getMyTeams,
  getAllStartups,
};