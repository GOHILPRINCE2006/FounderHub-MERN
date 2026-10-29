const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const { generateToken, sendTokenCookie } = require("../utils/generateToken");

// @route POST /api/v1/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, password, role, phone } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : req.body.email;

  if (!name || !email || !password || !role || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  if (!/^\d{10}$/.test(String(phone).trim())) {
    throw new ApiError(400, "Phone number must be exactly 10 digits");
  }

  const allowedRoles = ["founder", "developer", "mentor", "investor"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role. Admin cannot be self-assigned");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const existingPhone = await User.findOne({ phone: String(phone).trim() });
  if (existingPhone) {
    throw new ApiError(409, "Phone number already registered");
  }

  let user;
  try {
    user = await User.create({
      name,
      email,
      password,
      role,
      phone: String(phone).trim(),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === "email") throw new ApiError(409, "Email already registered");
      if (field === "phone") throw new ApiError(409, "Phone number already registered");
      throw new ApiError(409, "Duplicate value");
    }
    throw error;
  }

  // ✅ RESTORED: Generate token and set cookie
  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  // Re-fetch so password is excluded (select:false).
  const safeUser = await User.findById(user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"));
});

// @route POST /api/v1/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : req.body.email;

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

  // ✅ RESTORED: Generate token and set cookie
  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  // Strip password before returning.
  user.password = undefined;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Login successful"));
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