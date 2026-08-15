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
  const allowedFields = ["name", "skills", "portfolioLinks", "experience", "about"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

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
  if (!req.file) {
    throw new ApiError(400, "No image file provided");
  }

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