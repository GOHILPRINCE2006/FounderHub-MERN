const mongoose = require("mongoose");

const investorConnectionSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "", // optional note from investor when sending the request
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// No uniqueness constraint on (startup, investor) — an investor may send
// multiple connection requests to the same startup over time, same as
// mentor feedback requests.

module.exports = mongoose.model("InvestorConnection", investorConnectionSchema);