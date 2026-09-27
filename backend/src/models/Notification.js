const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_APPLICATION",
        "APPLICATION_ACCEPTED",
        "APPLICATION_REJECTED",
        "TASK_ASSIGNED",
        "MENTOR_FEEDBACK_RECEIVED",
        "INVESTOR_REQUEST_RECEIVED",
        "INVESTOR_REQUEST_ACCEPTED",
        "INVESTOR_REQUEST_REJECTED",
        "VERIFICATION_APPROVED",
        "VERIFICATION_REJECTED",
        "FUNDING_REQUEST_RECEIVED",
        "FUNDING_REQUEST_ACCEPTED",
        "FUNDING_REQUEST_DECLINED",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    relatedStartup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);