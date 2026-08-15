const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new ApiError(401, "Not authorized, no token found");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Not authorized, token invalid or expired");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "Not authorized, user not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  req.user = user; // attach user to request for use in controllers
  next();
});

module.exports = protect;