const mongoose = require("mongoose");

const recruitmentPostSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    roleTitle: {
      type: String,
      required: [true, "Role title is required"],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    isOpen: {
      type: Boolean,
      default: true, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecruitmentPost", recruitmentPostSchema);