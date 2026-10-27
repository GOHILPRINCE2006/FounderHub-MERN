const express = require("express");
const router = express.Router();

const {
  createStartup,
  updateStartup,
  deleteStartup,
  getStartupById,
  getMyStartups, // <-- Updated import
  getMyTeams,
  getAllStartups,
} = require("../controllers/startup.controller");

const protect = require("../middlewares/auth.middleware");
const optionalAuth = require("../middlewares/optionalAuth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/", getAllStartups);
router.get("/my-startups", protect, authorizeRoles("founder"), getMyStartups); // <-- Updated route
router.get("/my-teams", protect, getMyTeams); 
router.get("/:id", optionalAuth, getStartupById);

router.post("/", protect, authorizeRoles("founder"), upload.single("logo"), createStartup);
router.put("/:id", protect, authorizeRoles("founder"), upload.single("logo"), updateStartup);
router.delete("/:id", protect, authorizeRoles("founder"), deleteStartup);

module.exports = router;