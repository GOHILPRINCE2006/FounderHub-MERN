const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

// Like `protect`, but never throws on a missing/invalid/expired token —
// it just proceeds without req.user. Used on routes that are public by
// default but need to behave differently for a logged-in user (e.g. a
// founder viewing their own hidden startup, or an admin viewing any
// startup regardless of moderation status).
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Invalid/expired token on a public route — proceed unauthenticated
    // rather than blocking the request.
  }

  next();
});

module.exports = optionalAuth;