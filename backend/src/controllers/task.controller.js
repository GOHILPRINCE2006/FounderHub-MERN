const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Task = require("../models/Task");
const Startup = require("../models/Startup");
const sendNotification = require("../utils/sendNotification");

const getAuthorizedStartup = async (startupId, userId) => {
  const startup = await Startup.findById(startupId);
  if (!startup) throw new ApiError(404, "Startup not found");

  const isFounder = startup.founder.toString() === userId.toString();
  const isTeamMember = startup.teamMembers.some((m) => m.toString() === userId.toString());

  if (!isFounder && !isTeamMember) {
    throw new ApiError(403, "You are not authorized to access this startup's tasks");
  }
  return { startup, isFounder };
};

// @route POST /api/v1/tasks
// @access Founder only
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedMember, startupId } = req.body;

  if (!title || !startupId) {
    throw new ApiError(400, "Title and startupId are required");
  }

  const startup = await Startup.findById(startupId);
  if (!startup) throw new ApiError(404, "Startup not found");

  if (startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the founder can create tasks for this startup");
  }

  if (assignedMember) {
    const isMember = startup.teamMembers.some((m) => m.toString() === assignedMember);
    if (!isMember) throw new ApiError(400, "Assigned user is not a team member");
  }

  const task = await Task.create({
    title,
    description: description || "",
    assignedMember: assignedMember || null,
    startup: startupId,
    createdBy: req.user._id,
  });

  if (assignedMember) {
    await sendNotification(req, {
      recipient: assignedMember,
      type: "TASK_ASSIGNED",
      message: `You were assigned a new task: "${task.title}" on ${startup.name}`,
      link: `/founder/${startup._id}/tasks`,
      relatedStartup: startup._id,
    });
  }

  return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

// @route GET /api/v1/tasks/startup/:startupId
const getTasksForStartup = asyncHandler(async (req, res) => {
  await getAuthorizedStartup(req.params.startupId, req.user._id);
  const tasks = await Task.find({ startup: req.params.startupId })
    .populate("assignedMember", "name email avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

// @route GET /api/v1/tasks/my-tasks
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedMember: req.user._id })
    .populate("startup", "name logo")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, tasks, "Your assigned tasks fetched"));
});

// @route PUT /api/v1/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["To-Do", "In Progress", "Done"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status value");

  const task = await Task.findById(req.params.id).populate("startup");
  if (!task) throw new ApiError(404, "Task not found");

  const isFounder = task.startup.founder.toString() === req.user._id.toString();
  const isAssignee = task.assignedMember && task.assignedMember.toString() === req.user._id.toString();

  if (!isFounder && !isAssignee) throw new ApiError(403, "You are not authorized to update this task");

  task.status = status;
  await task.save();
  return res.status(200).json(new ApiResponse(200, task, "Task status updated"));
});

// @route DELETE /api/v1/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("startup");
  if (!task) throw new ApiError(404, "Task not found");

  if (task.startup.founder.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the founder can delete tasks");
  }

  await task.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
});

module.exports = { createTask, getTasksForStartup, getMyTasks, updateTaskStatus, deleteTask };