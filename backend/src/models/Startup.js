const mongoose = require("mongoose");

const startupSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Public ---
    name: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    description: {
      // kept for backward compatibility; no longer edited from the form
      type: String,
      default: "",
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    requiredRoles: {
      type: [String],
      default: [],
    },
    lookingFor: {
      type: [String],
      default: [],
    },
    stage: {
      type: String,
      enum: ["Idea", "MVP", "Funded", "Scaling"],
      default: "Idea",
    },
    isModerated: {
      type: Boolean,
      default: true,
    },

    // --- Private (visible only to founder, team, approved investor,
    //     requesting mentor, admin) ---
    problem: {
      type: String,
      default: "",
    },
    solution: {
      type: String,
      default: "",
    },
    teamSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    foundingYear: {
      type: Number,
      default: null,
    },
    fundingStatus: {
      type: String,
      enum: ["", "Bootstrapped", "Pre-seed", "Seed", "Raised"],
      default: "",
    },
    traction: {
      type: String,
      default: "",
    },
    technologies: {
      type: [String],
      default: [],
    },

    teamMembers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Startup", startupSchema);