import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Rocket,
  Users,
  Kanban,
  MessageSquare,
  GraduationCap,
  TrendingUp,
  Banknote,
  BarChart3,
} from "lucide-react";

const ICON = "h-4 w-4";

const FOUNDER_NAV_ITEMS = [
  { label: "Overview",    to: "/dashboard",           icon: <LayoutDashboard className={ICON} /> },
  { label: "My Startup",  to: "/founder/startup",     icon: <Rocket className={ICON} /> },
  { label: "Recruitment", to: "/founder/recruitment", icon: <Users className={ICON} /> },
  { label: "Tasks",       to: "/founder/tasks",       icon: <Kanban className={ICON} /> },
  { label: "Team Chat",   to: "/founder/chat",        icon: <MessageSquare className={ICON} /> },
  { label: "Mentors",     to: "/founder/mentors",     icon: <GraduationCap className={ICON} /> },
  { label: "Investors",   to: "/founder/investors",   icon: <TrendingUp className={ICON} /> },
  { label: "Funding",     to: "/founder/funding",     icon: <Banknote className={ICON} /> },
  { label: "Progress",    to: "/founder/progress",    icon: <BarChart3 className={ICON} /> },
];

export default function FounderShell() {
  return <DashboardLayout navItems={FOUNDER_NAV_ITEMS} />;
}