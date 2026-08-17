const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
      unique: true, // one conversation per startup
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);