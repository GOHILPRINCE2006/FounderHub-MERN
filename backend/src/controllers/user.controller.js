const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @route GET /api/v1/users/profile
const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

// @route PUT /api/v1/users/profile
const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = [
    // common
    "name", "phone", "location", "github", "linkedin", "website",
    "skills", "experience", "about",
    // role-specific
    "availability", "expertise", "yearsOfExperience", "currentRole",
    "company", "investmentFocus", "ticketSize",
    // mentor-specific
    "sessionPrice",
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Required fields
  const required = ["name", "phone", "about"];
  for (const f of required) {
    if (f in updates && (!updates[f] || !String(updates[f]).trim())) {
      throw new ApiError(400, `${f} is required`);
    }
  }

  // Phone: exactly 10 digits
  if (updates.phone !== undefined) {
    const phoneStr = String(updates.phone).trim();
    if (!/^\d{10}$/.test(phoneStr)) {
      throw new ApiError(400, "Phone number must be exactly 10 digits");
    }
    updates.phone = phoneStr;
  }

  // yearsOfExperience: coerce to number, non-negative
  if (updates.yearsOfExperience !== undefined && updates.yearsOfExperience !== "") {
    const n = Number(updates.yearsOfExperience);
    if (Number.isNaN(n) || n < 0) {
      throw new ApiError(400, "Years of experience must be a non-negative number");
    }
    updates.yearsOfExperience = n;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

// @route POST /api/v1/users/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");
  const result = await uploadToCloudinary(req.file.buffer, "foundrhub/avatars");
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar uploaded successfully"));
});

module.exports = { getProfile, updateProfile, uploadAvatar };