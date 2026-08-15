const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Sends token as httpOnly cookie. Works in dev (HTTP) and prod (HTTPS) automatically.
const sendTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // true only in production (HTTPS required)
    sameSite: isProduction ? "none" : "lax", // "none" needed for cross-site HTTPS cookies in prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

module.exports = { generateToken, sendTokenCookie };