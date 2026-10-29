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
    // The founder's pitch/message to the investor
    pitch: {
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

    // Request Status
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Invested", "Withdrawn"],
      default: "Pending",
    },
    
    // Payment / Deal Status
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },

    respondedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvestorConnection", investorConnectionSchema);