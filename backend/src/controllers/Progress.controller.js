const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const checkStartupAccess = require("../utils/checkStartupAccess");
const Task = require("../models/Task");
const RecruitmentPost = require("../models/RecruitmentPost");
const Application = require("../models/Application");
const MentorFeedback = require("../models/MentorFeedback");

// @route GET /api/v1/progress/startup/:startupId
// @access Founder or team members of that startup only
//
// Deliberately kept simple per spec ("do not overcomplicate analytics") —
// everything is computed on read from existing collections. No new
// write-time bookkeeping (e.g. a dedicated ActivityLog collection) was
// introduced for this.
const getStartupProgress = asyncHandler(async (req, res) => {
  const { startup } = await checkStartupAccess(req.params.startupId, req.user._id);

  const [tasks, recruitmentPosts, applications, mentorFeedback] = await Promise.all([
    Task.find({ startup: startup._id }).populate("assignedMember", "name avatar"),
    RecruitmentPost.find({ startup: startup._id }),
    Application.find({ startup: startup._id }),
    MentorFeedback.find({ startup: startup._id }).populate("mentor", "name"),
  ]);

  // --- Task completion ---
  const totalTasks = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const todoCount = tasks.filter((t) => t.status === "To-Do").length;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

  // --- Team contribution overview (per assigned member) ---
  const contributionMap = {};
  tasks.forEach((task) => {
    if (!task.assignedMember) return;
    const id = task.assignedMember._id.toString();
    if (!contributionMap[id]) {
      contributionMap[id] = {
        user: {
          _id: task.assignedMember._id,
          name: task.assignedMember.name,
          avatar: task.assignedMember.avatar,
        },
        assigned: 0,
        completed: 0,
      };
    }
    contributionMap[id].assigned += 1;
    if (task.status === "Done") {
      contributionMap[id].completed += 1;
    }
  });
  const teamContribution = Object.values(contributionMap);

  // --- Recruitment stats ---
  const totalPosts = recruitmentPosts.length;
  const openPosts = recruitmentPosts.filter((p) => p.isOpen).length;
  const closedPosts = totalPosts - openPosts;
  const pendingApplications = applications.filter((a) => a.status === "Pending").length;
  const acceptedApplications = applications.filter((a) => a.status === "Accepted").length;
  const rejectedApplications = applications.filter((a) => a.status === "Rejected").length;

  // --- Activity timeline (merged from existing timestamps, most recent 20) ---
  const activity = [];

  tasks.forEach((task) => {
    activity.push({
      type: "TASK_CREATED",
      message: `Task "${task.title}" was created`,
      timestamp: task.createdAt,
    });
  });

  applications.forEach((application) => {
    activity.push({
      type: "APPLICATION_SUBMITTED",
      message: "A new application was submitted",
      timestamp: application.createdAt,
    });
    if (application.status !== "Pending") {
      activity.push({
        type: `APPLICATION_${application.status.toUpperCase()}`,
        message: `An application was ${application.status.toLowerCase()}`,
        timestamp: application.updatedAt,
      });
    }
  });

  mentorFeedback.forEach((feedback) => {
    activity.push({
      type: "MENTOR_FEEDBACK_REQUESTED",
      message: `Mentor feedback requested from ${feedback.mentor?.name || "a mentor"}`,
      timestamp: feedback.createdAt,
    });
    if (feedback.status === "Reviewed") {
      activity.push({
        type: "MENTOR_FEEDBACK_RECEIVED",
        message: `${feedback.mentor?.name || "Mentor"} submitted feedback`,
        timestamp: feedback.updatedAt,
      });
    }
  });

  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const activityTimeline = activity.slice(0, 20);

  const progress = {
    taskStats: {
      total: totalTasks,
      todo: todoCount,
      inProgress: inProgressCount,
      done: doneCount,
      completionPercentage,
    },
    teamContribution,
    recruitmentStats: {
      totalPosts,
      openPosts,
      closedPosts,
      totalApplications: applications.length,
      pending: pendingApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
    },
    activityTimeline,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, progress, "Startup progress fetched successfully"));
});

module.exports = {
  getStartupProgress,
};