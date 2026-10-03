const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const Startup = require("../models/Startup");
const Task = require("../models/Task");
const RecruitmentPost = require("../models/RecruitmentPost");
const Application = require("../models/Application");
const InvestorConnection = require("../models/InvestorConnection");
const sendNotification = require("../utils/sendNotification");

// ============ USER MANAGEMENT ============

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  const users = await User.find(filter).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") {
    throw new ApiError(403, "Admin accounts cannot be blocked from this panel");
  }
  user.isActive = false;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User blocked successfully"));
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  user.isActive = true;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User unblocked successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") {
    throw new ApiError(403, "Admin accounts cannot be deleted from this panel");
  }
  await user.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// ============ STARTUP MODERATION ============

const getAllStartupsAdmin = asyncHandler(async (req, res) => {
  const startups = await Startup.find()
    .populate("founder", "name email")
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, startups, "Startups fetched successfully"));
});

const hideStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) throw new ApiError(404, "Startup not found");
  startup.isModerated = false;
  await startup.save();
  return res
    .status(200)
    .json(new ApiResponse(200, startup, "Startup hidden from public listing"));
});

const unhideStartup = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) throw new ApiError(404, "Startup not found");
  startup.isModerated = true;
  await startup.save();
  return res
    .status(200)
    .json(new ApiResponse(200, startup, "Startup restored to public listing"));
});

const deleteStartupAdmin = asyncHandler(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) throw new ApiError(404, "Startup not found");
  await startup.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Startup deleted successfully"));
});

// ============ MENTOR / INVESTOR VERIFICATION ============

const getPendingVerifications = asyncHandler(async (req, res) => {
  const { role } = req.query;
  if (!role || !["mentor", "investor"].includes(role)) {
    throw new ApiError(400, "Query param 'role' must be 'mentor' or 'investor'");
  }
  const pendingUsers = await User.find({ role, isVerified: false }).sort({
    createdAt: -1,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, pendingUsers, "Pending verifications fetched"));
});

const approveVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!["mentor", "investor"].includes(user.role)) {
    throw new ApiError(400, "Only mentor or investor accounts can be verified");
  }

  // Mentors must have a complete, bookable profile before being verified.
  if (user.role === "mentor") {
    const missing = [];
    if (!user.currentRole) missing.push("current role");
    if (!user.company) missing.push("company");
    if (!user.expertise) missing.push("expertise");
    if (!user.yearsOfExperience) missing.push("years of experience");
    if (!user.sessionPrice || user.sessionPrice <= 0) missing.push("session price");

    if (missing.length > 0) {
      throw new ApiError(
        400,
        `Mentor profile is incomplete. Missing: ${missing.join(", ")}`
      );
    }
  }

  user.isVerified = true;
  await user.save();

  await sendNotification(req, {
    recipient: user._id,
    type: "VERIFICATION_APPROVED",
    message: `Your ${user.role} account has been verified`,
    link: "/profile",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));
});

const revokeVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!["mentor", "investor"].includes(user.role)) {
    throw new ApiError(400, "Only mentor or investor accounts can be verified");
  }
  const wasVerified = user.isVerified;
  user.isVerified = false;
  await user.save();

  await sendNotification(req, {
    recipient: user._id,
    type: "VERIFICATION_REJECTED",
    message: wasVerified
      ? `Your ${user.role} verification has been revoked`
      : `Your ${user.role} verification request was declined`,
    link: "/profile",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Verification updated successfully"));
});

// ============ PLATFORM STATS ============

const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalFounders,
    totalDevelopers,
    totalMentors,
    totalInvestors,
    blockedUsers,
    pendingMentorVerifications,
    pendingInvestorVerifications,
    totalStartups,
    hiddenStartups,
    totalTasks,
    totalRecruitmentPosts,
    totalApplications,
    totalInvestorConnections,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "founder" }),
    User.countDocuments({ role: "developer" }),
    User.countDocuments({ role: "mentor" }),
    User.countDocuments({ role: "investor" }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: "mentor", isVerified: false }),
    User.countDocuments({ role: "investor", isVerified: false }),
    Startup.countDocuments(),
    Startup.countDocuments({ isModerated: false }),
    Task.countDocuments(),
    RecruitmentPost.countDocuments(),
    Application.countDocuments(),
    InvestorConnection.countDocuments(),
  ]);

  const stats = {
    users: {
      total: totalUsers,
      founders: totalFounders,
      developers: totalDevelopers,
      mentors: totalMentors,
      investors: totalInvestors,
      blocked: blockedUsers,
    },
    verifications: {
      pendingMentors: pendingMentorVerifications,
      pendingInvestors: pendingInvestorVerifications,
    },
    startups: { total: totalStartups, hidden: hiddenStartups },
    activity: {
      totalTasks,
      totalRecruitmentPosts,
      totalApplications,
      totalInvestorConnections,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Platform stats fetched successfully"));
});

module.exports = {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAllStartupsAdmin,
  hideStartup,
  unhideStartup,
  deleteStartupAdmin,
  getPendingVerifications,
  approveVerification,
  revokeVerification,
  getPlatformStats,
};