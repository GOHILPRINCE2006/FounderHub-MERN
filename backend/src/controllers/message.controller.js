const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const checkStartupAccess = require("../utils/checkStartupAccess");

// @route GET /api/v1/messages/startup/:startupId
// @access Founder or team members of that startup
const getChatHistory = asyncHandler(async (req, res) => {
  await checkStartupAccess(req.params.startupId, req.user._id);

  const conversation = await Conversation.findOne({ startup: req.params.startupId });

  // No conversation yet means no messages have been sent — return empty array, not an error
  if (!conversation) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No messages yet"));
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 }); // oldest first, for chat display order

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Chat history fetched successfully"));
});

module.exports = { getChatHistory };