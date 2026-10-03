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
      required: true, // founder who sent the request
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    // Snapshot of the price at request time so the founder pays what they
    // agreed to even if the mentor later changes their rate.
    priceAtRequest: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      // Requested → Accepted → Paid   (happy path)
      // Requested → Declined           (mentor said no)
      enum: ["Requested", "Accepted", "Declined", "Paid"],
      default: "Requested",
    },
    respondedAt: { type: Date, default: null },
    paidAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

// One open request per (startup, mentor). Once paid or declined, a new one
// can be created later if both sides want to re-engage.
mentorFeedbackSchema.index(
  { startup: 1, mentor: 1, status: 1 },
  { unique: false }
);

module.exports = mongoose.model("MentorFeedback", mentorFeedbackSchema);