import { Outlet } from "react-router-dom";

// The dot-grid "blueprint" backdrop is the one signature visual moment,
// deliberately reserved for auth screens rather than spread across the app.
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blueprint px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl font-semibold text-ink">
            FoundrHub
          </span>
          <p className="mt-1 text-sm text-muted">
            Where student startups find their team.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}