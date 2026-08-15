const mongoose = require("mongoose");

const startupSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Note: not unique at DB level on purpose, so multiple startups
      // per founder can be supported later without a schema migration.
    },
    name: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
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
    requiredSkills: {
      type: [String],
      default: [],
    },
    requiredRoles: {
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
      default: true, // false = hidden/flagged by admin (Phase 13)
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