const express = require("express");
const router = express.Router();

const { getChatHistory } = require("../controllers/message.controller");
const protect = require("../middlewares/auth.middleware");

router.get("/startup/:startupId", protect, getChatHistory);

module.exports = router;