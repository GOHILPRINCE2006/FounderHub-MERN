const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes/index");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoundrHub API is running",
  });
});

// API routes
app.use("/api/v1", apiRoutes);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;