const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const { generateToken, sendTokenCookie } = require("../utils/generateToken");

// @route POST /api/v1/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "All fields are required");
  }

  const allowedRoles = ["founder", "developer", "mentor", "investor"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role. Admin cannot be self-assigned");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({ name, email, password, role });

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, userResponse, "User registered successfully"));
});

// @route POST /api/v1/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, "Login successful"));
});

// @route POST /api/v1/auth/logout
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

// @route GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

module.exports = { registerUser, loginUser, logoutUser, getMe };