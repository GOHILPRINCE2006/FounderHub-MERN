const mongoose = require("mongoose");

const investorConnectionSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    // What the founder proposed when sending the request.
    proposedAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    proposedEquity: {
      type: Number,
      required: true,
      min: 0.01,
      max: 100,
    },
    // What the investor actually paid (may differ after negotiation).
    finalAmount: { type: Number, default: null },
    finalEquity: { type: Number, default: null },

    status: {
      type: String,
      // Requested → Accepted → Invested   (happy path)
      // Requested → Declined               (investor said no)
      // Requested / Accepted → Withdrawn   (founder closed it)
      enum: ["Requested", "Accepted", "Declined", "Invested", "Withdrawn"],
      default: "Requested",
    },
    respondedAt: { type: Date, default: null },
    paidAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvestorConnection", investorConnectionSchema);