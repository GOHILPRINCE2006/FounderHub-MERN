const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // "mentor"     — founder pays mentor for a session
    // "investment" — investor pays founder, funds the startup
    paymentType: {
      type: String,
      enum: ["mentor", "investment"],
      required: true,
    },

    // Who paid and who received. For mentor payments: payer=founder, payee=mentor.
    // For investment payments: payer=investor, payee=founder.
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount:   { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },

    // --- Mentor-specific ---
    mentorRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorFeedback",
      default: null,
    },

    // --- Investment-specific ---
    investorConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestorConnection",
      default: null,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      default: null,
    },
    equityPercent: { type: Number, default: null },

    // --- Razorpay ---
    razorpayOrderId:   { type: String, default: "", index: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Created", "Paid", "Failed"],
      default: "Created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);