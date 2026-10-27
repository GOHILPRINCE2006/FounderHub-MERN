import { NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMyStartups } from "../../features/startup/startupSlice";
import {
  Rocket, BarChart3, Settings, Users,
  Kanban, MessageSquare, GraduationCap, TrendingUp, Plus, Search, Briefcase, Banknote,
  ArrowLeft, LayoutDashboard,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import AvatarMenu from "./AvatarMenu";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const ICON = "h-4 w-4";

// /founder/create or /founder/create/anything
const isCreatePath = (pathname) => /^\/founder\/create(\/|$)/.test(pathname);

// Returns the startupId from /founder/:startupId/*, or null.
// "create" is a reserved word, never an ID.
const getStartupIdFromPath = (pathname) => {
  const m = pathname.match(/^\/founder\/([^/]+)/);
  if (!m || m[1] === "create") return null;
  return m[1];
};

export default function Topbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myStartups, fetchStatus } = useSelector((state) => state.startup);
  const location = useLocation();

  useEffect(() => {
    if (user?.role === "founder" && fetchStatus === "idle") {
      dispatch(fetchMyStartups());
    }
  }, [dispatch, user, fetchStatus]);

  const onCreatePage = isCreatePath(location.pathname);
  const activeStartupId = getStartupIdFromPath(location.pathname);

  let navItems = [];

  if (user?.role === "founder") {
    if (onCreatePage) {
      // Creating a new startup: no workspace links
      navItems = [
        { label: "Back to Dashboard", to: "/dashboard", icon: <ArrowLeft className={ICON} /> },
      ];
    } else if (activeStartupId) {
      // Inside a workspace: links strictly use the ID from the URL
      const base = `/founder/${activeStartupId}`;
      navItems = [
        { label: "My Startup",  to: `${base}/dashboard`,   icon: <BarChart3 className={ICON} /> },
        { label: "Recruitment", to: `${base}/recruitment`, icon: <Users className={ICON} /> },
        { label: "Tasks",       to: `${base}/tasks`,       icon: <Kanban className={ICON} /> },
        { label: "Team Chat",   to: `${base}/chat`,        icon: <MessageSquare className={ICON} /> },
        { label: "Mentors",     to: `${base}/mentors`,     icon: <GraduationCap className={ICON} /> },
        { label: "Investors",   to: `${base}/investors`,   icon: <TrendingUp className={ICON} /> },
        { label: "Settings",    to: `${base}/settings`,    icon: <Settings className={ICON} /> },
        { label: "Create New",  to: `/founder/create`,     icon: <Plus className={ICON} /> },
      ];
    } else if (myStartups.length > 0) {
      // Generic page (/dashboard, /profile, ...): no guessed workspace.
      // Pick a workspace with the WorkspaceSwitcher.
      navItems = [
        { label: "Dashboard",  to: "/dashboard",      icon: <LayoutDashboard className={ICON} /> },
        { label: "Create New", to: "/founder/create", icon: <Plus className={ICON} /> },
      ];
    } else {
      navItems = [{ label: "Create Startup", to: "/founder/create", icon: <Rocket className={ICON} /> }];
    }
  } else if (user?.role === "developer") {
    navItems = [
      { label: "Browse Startups", to: "/browse-startups", icon: <Search className={ICON} /> },
      { label: "My Applications", to: "/my-applications", icon: <Briefcase className={ICON} /> },
      { label: "My Tasks",        to: "/my-tasks",        icon: <Kanban className={ICON} /> },
      { label: "Team Chat",       to: "/chat",            icon: <MessageSquare className={ICON} /> },
    ];
  } else if (user?.role === "mentor") {
    navItems = [{ label: "Feedback Queue", to: "/mentor/queue", icon: <GraduationCap className={ICON} /> }];
  } else if (user?.role === "investor") {
    navItems = [{ label: "Requests", to: "/investor/requests", icon: <Banknote className={ICON} /> }];
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-navy text-white">
      <div className="flex h-16 items-center gap-4 px-6 sm:px-8">

        {/* Brand (Not clickable) */}
        <div className="flex shrink-0 items-center gap-2.5 select-none">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold">
            <Rocket className="h-4 w-4 text-ink" strokeWidth={2.4} />
          </span>
          <span className="hidden font-display text-base font-semibold tracking-tight sm:inline">
            Founder<span className="text-gold">Hub</span>
          </span>
        </div>

        {/* Workspace Switcher: show if the founder has startups */}
        {user?.role === "founder" && myStartups.length > 0 && (
          <div className="border-l border-white/10 pl-4">
            <WorkspaceSwitcher />
          </div>
        )}

        {/* Primary nav */}
        <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-thin ml-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive ? "bg-gold font-medium text-ink" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-1.5">
          <NotificationBell />
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}