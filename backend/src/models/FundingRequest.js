const mongoose = require("mongoose");

const fundingRequestSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    equityOffered: {
      type: Number,
      required: [true, "Equity offered is required"],
      min: [0.01, "Equity must be greater than 0"],
      max: [100, "Equity cannot exceed 100%"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: "Pending",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent multiple active (Pending or Accepted) requests from the same
// founder to the same investor on the same startup. Declined ones are
// allowed to repeat.
fundingRequestSchema.index(
  { founder: 1, investor: 1, startup: 1, status: 1 },
  { unique: false }
);

module.exports = mongoose.model("FundingRequest", fundingRequestSchema);