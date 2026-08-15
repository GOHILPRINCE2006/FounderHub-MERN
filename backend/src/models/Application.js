const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    recruitmentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruitmentPost",
      required: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverMessage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Enforce one application per user per recruitment post, permanently.
applicationSchema.index({ recruitmentPost: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);