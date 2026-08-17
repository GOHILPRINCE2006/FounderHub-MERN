const mongoose = require("mongoose");

const mentorFeedbackSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // the founder who sent the request
    },
    feedbackText: {
      type: String,
      default: "", // empty until mentor submits feedback
    },
    status: {
      type: String,
      enum: ["Requested", "Reviewed"],
      default: "Requested",
    },
  },
  { timestamps: true } // createdAt = request time, updatedAt = feedback submission time
);

module.exports = mongoose.model("MentorFeedback", mentorFeedbackSchema);