// Where clicking a notification should take the user.
//
// The backend also sends a `link` string, but those values are placeholder
// paths (e.g. /startups/:id/applications) that don't exist in this app's
// routing, so we route by notification type instead.
export function getNotificationRoute(notification, role) {
  switch (notification.type) {
    case "NEW_APPLICATION":
      return "/founder/recruitment";
    case "APPLICATION_ACCEPTED":
    case "APPLICATION_REJECTED":
      return "/my-applications";
    case "TASK_ASSIGNED":
      return "/my-tasks";
    case "MENTOR_FEEDBACK_RECEIVED":
      return "/founder/mentors";
    case "INVESTOR_REQUEST_RECEIVED":
      return "/founder/investors";
    case "INVESTOR_REQUEST_ACCEPTED":
    case "INVESTOR_REQUEST_REJECTED":
      return "/investor/requests";
    case "VERIFICATION_APPROVED":
      if (role === "mentor") return "/mentor/queue";
      if (role === "investor") return "/investor/startups";
      return "/dashboard";
    default:
      return "/dashboard";
  }
}
