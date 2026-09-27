const ApiError = require("./ApiError");
const Startup = require("../models/Startup");
const InvestorConnection = require("../models/InvestorConnection");
const MentorFeedback = require("../models/MentorFeedback");

// Determines whether the viewer can see this startup's private fields.
// Rules (any true ⇒ private visible):
//   - viewer is the founder
//   - viewer is a team member
//   - viewer is an investor with an Accepted InvestorConnection on this startup
//   - viewer is a mentor with a MentorFeedback row on this startup
//   - viewer is an admin
async function canViewPrivate(startup, userId, role) {
  if (!userId) return false;
  if (role === "admin") return true;

  const uid = userId.toString();

  if (startup.founder.toString() === uid) return true;
  if (startup.teamMembers.some((m) => m.toString() === uid)) return true;

  if (role === "investor") {
    const conn = await InvestorConnection.findOne({
      startup: startup._id,
      investor: userId,
      status: "Accepted",
    });
    if (conn) return true;
  }

  if (role === "mentor") {
    const fb = await MentorFeedback.findOne({
      startup: startup._id,
      mentor: userId,
    });
    if (fb) return true;
  }

  return false;
}

// Existing helper — checks founder or team member. Throws if not.
const checkStartupAccess = async (startupId, userId) => {
  const startup = await Startup.findById(startupId);
  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  const isFounder = startup.founder.toString() === userId.toString();
  const isTeamMember = startup.teamMembers.some(
    (m) => m.toString() === userId.toString()
  );

  if (!isFounder && !isTeamMember) {
    throw new ApiError(403, "You are not authorized to access this startup's resources");
  }

  return { startup, isFounder, isTeamMember };
};

module.exports = checkStartupAccess;
module.exports.canViewPrivate = canViewPrivate;