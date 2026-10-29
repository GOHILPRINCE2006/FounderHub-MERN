const Startup = require("../models/Startup");
const RecruitmentPost = require("../models/RecruitmentPost");
const Application = require("../models/Application");
const Task = require("../models/Task");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const MentorFeedback = require("../models/MentorFeedback");
const InvestorConnection = require("../models/InvestorConnection");
const FundingRequest = require("../models/FundingRequest");
const Notification = require("../models/Notification");

// Removes everything that hangs off one startup so no orphaned rows remain
// (orphans caused `startup: null` crashes in the UI).
// Payment rows are intentionally KEPT: they are the financial ledger.
async function deleteStartupCascade(startupId) {
  const posts = await RecruitmentPost.find({ startup: startupId }).select("_id");
  const postIds = posts.map((p) => p._id);

  const convos = await Conversation.find({ startup: startupId }).select("_id");
  await Message.deleteMany({ conversation: { $in: convos.map((c) => c._id) } });

  await Promise.all([
    Application.deleteMany({ $or: [{ startup: startupId }, { recruitmentPost: { $in: postIds } }] }),
    RecruitmentPost.deleteMany({ startup: startupId }),
    Task.deleteMany({ startup: startupId }),
    Conversation.deleteMany({ startup: startupId }),
    MentorFeedback.deleteMany({ startup: startupId }),
    InvestorConnection.deleteMany({ startup: startupId }),
    FundingRequest.deleteMany({ startup: startupId }),
    Notification.deleteMany({ relatedStartup: startupId }),
  ]);

  await Startup.deleteOne({ _id: startupId });
}

async function deleteUserCascade(userId) {
  const owned = await Startup.find({ founder: userId }).select("_id");
  for (const s of owned) await deleteStartupCascade(s._id);

  const User = require("../models/User");
  await Promise.all([
    Startup.updateMany({ teamMembers: userId }, { $pull: { teamMembers: userId } }),
    Task.updateMany({ assignedMember: userId }, { $set: { assignedMember: null } }),
    Application.deleteMany({ applicant: userId }),
    MentorFeedback.deleteMany({ $or: [{ mentor: userId }, { founder: userId }] }),
    InvestorConnection.deleteMany({ $or: [{ investor: userId }, { founder: userId }] }),
    Notification.deleteMany({ recipient: userId }),
  ]);
  await User.deleteOne({ _id: userId });
}

module.exports = { deleteStartupCascade, deleteUserCascade };
