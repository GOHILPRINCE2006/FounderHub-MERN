// Founder notifications must open the right startup workspace
// (/founder/:startupId/...). The id comes from notification.relatedStartup,
// which is a populated object in the REST list and a plain id over the socket.
const startupIdOf = (n) => n.relatedStartup?._id || n.relatedStartup || null;

export function getNotificationRoute(notification, role) {
  const sid = startupIdOf(notification);
  const workspace = (page) => (sid ? `/founder/${sid}/${page}` : "/dashboard");

  switch (notification.type) {
    case "NEW_APPLICATION":
      return workspace("recruitment");
    case "APPLICATION_ACCEPTED":
    case "APPLICATION_REJECTED":
      return "/my-applications";
    case "TASK_ASSIGNED":
      return "/my-tasks";
    case "MENTOR_FEEDBACK_RECEIVED":
    case "MENTOR_REQUEST_ACCEPTED":
    case "MENTOR_REQUEST_DECLINED":
    case "MENTOR_SESSION_COMPLETED":
      return workspace("mentors");
    case "MENTOR_REQUEST_RECEIVED":
    case "MENTOR_REQUEST_PAID":
      return "/mentor/queue";
    case "INVESTOR_REQUEST_ACCEPTED":
    case "INVESTOR_REQUEST_REJECTED":
    case "INVESTMENT_REQUEST_ACCEPTED":
    case "INVESTMENT_REQUEST_DECLINED":
    case "INVESTMENT_PAYMENT_RECEIVED":
    case "INVESTMENT_DEAL_COMPLETED":
      return workspace("investors");
    case "INVESTOR_REQUEST_RECEIVED":
    case "INVESTMENT_REQUEST_RECEIVED":
    case "INVESTMENT_REQUEST_WITHDRAWN":
      return "/investor/requests";
    case "VERIFICATION_APPROVED":
      if (role === "mentor") return "/mentor/queue";
      if (role === "investor") return "/investor/requests";
      return "/dashboard";
    case "VERIFICATION_REJECTED":
      return "/profile";
    default:
      return "/dashboard";
  }
}
