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
    case "MENTOR_REQUEST_RECEIVED":
      return "/mentor/queue";
    case "MENTOR_REQUEST_ACCEPTED":
    case "MENTOR_REQUEST_DECLINED":
    case "MENTOR_REQUEST_PAID":
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
    case "VERIFICATION_REJECTED":
      return "/profile";
    case "FUNDING_REQUEST_RECEIVED":
      return "/investor/funding";
    case "FUNDING_REQUEST_ACCEPTED":
    case "FUNDING_REQUEST_DECLINED":
      return "/founder/funding";
    case "INVESTMENT_REQUEST_RECEIVED":
      return "/investor/requests";
    case "INVESTMENT_REQUEST_ACCEPTED":
    case "INVESTMENT_REQUEST_DECLINED":
      return "/founder/investors";
    case "INVESTMENT_PAYMENT_RECEIVED":
      return "/founder/investors";
    default:
      return "/dashboard";
  }
}