const mongoose = require("mongoose");

const mentorFeedbackSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The founder who sent the request
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // --- Request Details ---
    challenge: {
      type: String,
      required: true,
      trim: true,
    },
    goals: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    preferredFormat: {
      type: String,
      default: "1-on-1",
    },
    priceAtRequest: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --- Request Status ---
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Cancelled"],
      default: "Pending",
    },
    declineReason: {
      type: String,
      default: "",
    },

    // --- Session Status (After Acceptance) ---
    sessionStatus: {
      type: String,
      enum: ["NotScheduled", "Scheduled", "Completed"],
      default: "NotScheduled",
    },
    sessionDate: {
      type: Date,
      default: null,
    },
    meetingLink: {
      type: String,
      default: "",
    },

    // --- Payment ---
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    respondedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index to quickly find requests by mentor or founder
mentorFeedbackSchema.index({ mentor: 1, status: 1 });
mentorFeedbackSchema.index({ founder: 1, status: 1 });

module.exports = mongoose.model("MentorFeedback", mentorFeedbackSchema);