const express = require("express");
const router = express.Router();

const { getStartupProgress } = require("../controllers/progress.controller");

const protect = require("../middlewares/auth.middleware");

router.get("/startup/:startupId", protect, getStartupProgress);

module.exports = router;