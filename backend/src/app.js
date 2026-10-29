const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes/index");
const errorHandler = require("./middlewares/error.middleware");
const ApiError = require("./utils/ApiError");

const app = express();

// Required behind Render/Railway/Heroku style proxies (correct protocol/IP).
app.set("trust proxy", 1);

// CLIENT_URL may hold several origins separated by commas.
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // no Origin header = same-origin / curl / server-to-server
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "FoundrHub API is running" });
});

app.use("/api/v1", apiRoutes);

// Unknown API routes -> JSON 404
app.use("/api", (req, res, next) => next(new ApiError(404, "API route not found")));

// Optional: serve the built React app from the same server (single-service deploy).
// Enabled automatically when ../frontend/dist exists.
const distDir = path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(path.join(distDir, "index.html"))) {
  app.use(express.static(distDir));
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/socket.io")) return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
module.exports.allowedOrigins = allowedOrigins;
