const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not our custom ApiError, convert it into one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
  });
};

module.exports = errorHandler;