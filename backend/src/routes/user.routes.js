const express = require("express");
const router = express.Router();

const { getProfile, updateProfile, uploadAvatar } = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;