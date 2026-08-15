const express = require("express");
const router = express.Router();

const {
  createRecruitmentPost,
  getAllRecruitmentPosts,
  getRecruitmentPostById,
  getMyRecruitmentPosts,
  updateRecruitmentPost,
  deleteRecruitmentPost,
} = require("../controllers/recruitment.controller");

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/", getAllRecruitmentPosts);
router.get("/my-posts", protect, authorizeRoles("founder"), getMyRecruitmentPosts);
router.get("/:id", getRecruitmentPostById);

router.post("/", protect, authorizeRoles("founder"), createRecruitmentPost);
router.put("/:id", protect, authorizeRoles("founder"), updateRecruitmentPost);
router.delete("/:id", protect, authorizeRoles("founder"), deleteRecruitmentPost);

module.exports = router;