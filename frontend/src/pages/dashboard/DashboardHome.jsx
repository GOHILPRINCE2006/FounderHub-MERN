import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Rocket, Users, Kanban, MessageSquare, GraduationCap, TrendingUp,
  Briefcase, Compass, Search, ShieldCheck,
} from "lucide-react";

const QUICK_LINKS = {
  founder: [
    { to: "/founder/startup",     label: "My Startup",   icon: Rocket,        hint: "Create or edit your startup" },
    { to: "/founder/recruitment", label: "Recruitment",  icon: Users,         hint: "Post roles and review applicants" },
    { to: "/founder/tasks",       label: "Task Board",   icon: Kanban,        hint: "Assign and track work" },
    { to: "/founder/mentors",     label: "Mentors",      icon: GraduationCap, hint: "Request feedback" },
    { to: "/founder/investors",   label: "Investors",    icon: TrendingUp,    hint: "Review connection requests" },
    { to: "/founder/chat",        label: "Team Chat",    icon: MessageSquare, hint: "Talk with your team" },
  ],
  developer: [
    { to: "/browse-startups", label: "Browse Startups", icon: Search,        hint: "Find startups that need your skills" },
    { to: "/my-applications", label: "Applications",    icon: Briefcase,     hint: "Track your applications" },
    { to: "/my-tasks",        label: "My Tasks",        icon: Kanban,        hint: "Work assigned to you" },
    { to: "/chat",            label: "Team Chat",       icon: MessageSquare, hint: "Talk with your team" },
  ],
  mentor: [
    { to: "/mentor/queue", label: "Feedback Queue", icon: GraduationCap, hint: "Review requested feedback" },
    { to: "/profile",      label: "Profile",        icon: Users,         hint: "Update your details" },
  ],
  investor: [
    { to: "/investor/startups", label: "Discover Startups", icon: Compass,    hint: "Browse startups" },
    { to: "/investor/requests", label: "My Requests",       icon: TrendingUp, hint: "Track sent requests" },
    { to: "/profile",           label: "Profile",           icon: Users,      hint: "Update your details" },
  ],
};

const ROLE_LABEL = {
  founder: "Founder",
  developer: "Developer",
  mentor: "Mentor",
  investor: "Investor",
  admin: "Admin",
};

export default function DashboardHome() {
  const { user } = useSelector((state) => state.auth);
  const links = QUICK_LINKS[user?.role] || [];
  const awaitingVerification =
    (user?.role === "mentor" || user?.role === "investor") && !user?.isVerified;

  return (
    <div className="mx-auto max-w-5xl">
      {awaitingVerification && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-bg px-4 py-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
          <div>
            <p className="text-sm font-medium text-ink">
              Your {user.role} account is awaiting verification
            </p>
            <p className="mt-0.5 text-sm text-muted">
              An admin needs to verify your account before you can{" "}
              {user.role === "mentor"
                ? "receive feedback requests from founders"
                : "send connection requests to startups"}.
              You'll get a notification once it's approved.
            </p>
          </div>
        </div>
      )}

      {/* Welcome card with left accent */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <div className="absolute inset-y-0 left-0 w-1 bg-gold" aria-hidden="true" />
        <div className="flex flex-wrap items-start justify-between gap-4 pl-2">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              {ROLE_LABEL[user?.role] || "Dashboard"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
              Welcome back, {user?.name?.split(" ")[0] || "there"}.
            </h2>
            <p className="mt-1 text-sm text-muted">
              Signed in as <span className="text-ink">{user?.email}</span>
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 text-xs font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Active
          </span>
        </div>
      </div>

      {/* Quick actions */}
      {links.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">
            Quick actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper transition-colors group-hover:bg-gold/15">
                  <l.icon className="h-4 w-4 text-ink transition-colors group-hover:text-gold-dark" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-ink">
                    {l.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{l.hint}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}