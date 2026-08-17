const ApiError = require("./ApiError");
const Startup = require("../models/Startup");

// Checks if a user is the founder or a team member of a startup.
// Throws ApiError if not authorized or startup doesn't exist.
const checkStartupAccess = async (startupId, userId) => {
  const startup = await Startup.findById(startupId);
  if (!startup) {
    throw new ApiError(404, "Startup not found");
  }

  const isFounder = startup.founder.toString() === userId.toString();
  const isTeamMember = startup.teamMembers.some((m) => m.toString() === userId.toString());

  if (!isFounder && !isTeamMember) {
    throw new ApiError(403, "You are not authorized to access this startup's resources");
  }

  return { startup, isFounder, isTeamMember };
};

module.exports = checkStartupAccess;