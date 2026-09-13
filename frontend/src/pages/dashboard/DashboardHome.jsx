import { useSelector } from "react-redux";

export default function DashboardHome() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Welcome, {user?.name}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Logged in as <span className="font-medium text-ink">{user?.email}</span>{" "}
        — role: <span className="font-mono text-xs">{user?.role}</span>
      </p>
      <p className="mt-4 text-sm text-muted">
        This is a placeholder. Your real {user?.role} dashboard is built in a later phase.
      </p>
    </div>
  );
}