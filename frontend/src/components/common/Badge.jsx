// Central place mapping backend status strings to a visual tone, so every
// later phase (applications, tasks, mentor feedback, investor requests,
// admin) renders the same status word the same way.
const TONE_BY_STATUS = {
  Pending: "warning",
  "To-Do": "warning",
  "In Progress": "info",
  Done: "success",
  Accepted: "success",
  Reviewed: "success",
  Active: "success",
  Rejected: "danger",
  Blocked: "danger",
  Open: "success",
  Closed: "neutral",
};

const TONE_CLASSES = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-gold-dark",
  danger: "bg-danger-bg text-danger",
  info: "bg-navy/10 text-navy",
  neutral: "bg-paper text-muted",
};

export default function Badge({ status, tone, children }) {
  const resolvedTone = tone || TONE_BY_STATUS[status] || "neutral";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[resolvedTone]}`}
    >
      {children || status}
    </span>
  );
}