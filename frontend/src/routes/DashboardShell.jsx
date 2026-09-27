import { useSelector } from "react-redux";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  LayoutDashboard, Compass, Briefcase, Kanban, MessageSquare,
  Search, Rocket, Users, GraduationCap, TrendingUp, Send, BarChart3,
  Banknote,
} from "lucide-react";

const ICON = "h-4 w-4";

const navByRole = {
  founder: [
    { label: "Overview",    to: "/dashboard",           icon: <LayoutDashboard className={ICON} /> },
    { label: "My Startup",  to: "/founder/startup",     icon: <Rocket className={ICON} /> },
    { label: "Recruitment", to: "/founder/recruitment", icon: <Users className={ICON} /> },
    { label: "Tasks",       to: "/founder/tasks",       icon: <Kanban className={ICON} /> },
    { label: "Team Chat",   to: "/founder/chat",        icon: <MessageSquare className={ICON} /> },
    { label: "Mentors",     to: "/founder/mentors",     icon: <GraduationCap className={ICON} /> },
    { label: "Investors",   to: "/founder/investors",   icon: <TrendingUp className={ICON} /> },
    { label: "Funding",     to: "/founder/funding",     icon: <Banknote className={ICON} /> },
    { label: "Progress",    to: "/founder/progress",    icon: <BarChart3 className={ICON} /> },
  ],
  developer: [
    { label: "Overview",        to: "/dashboard",       icon: <LayoutDashboard className={ICON} /> },
    { label: "Browse Startups", to: "/browse-startups", icon: <Search className={ICON} /> },
    { label: "My Applications", to: "/my-applications", icon: <Briefcase className={ICON} /> },
    { label: "My Tasks",        to: "/my-tasks",        icon: <Kanban className={ICON} /> },
    { label: "Team Chat",       to: "/chat",            icon: <MessageSquare className={ICON} /> },
  ],
  mentor: [
    { label: "Overview",       to: "/dashboard",    icon: <LayoutDashboard className={ICON} /> },
    { label: "Feedback Queue", to: "/mentor/queue", icon: <GraduationCap className={ICON} /> },
  ],
  investor: [
    { label: "Overview",          to: "/dashboard",         icon: <LayoutDashboard className={ICON} /> },
    { label: "Discover Startups", to: "/investor/startups", icon: <Compass className={ICON} /> },
    { label: "Funding",           to: "/investor/funding",  icon: <Banknote className={ICON} /> },
    { label: "My Requests",       to: "/investor/requests", icon: <Send className={ICON} /> },
  ],
};

export default function DashboardShell() {
  const { user } = useSelector((state) => state.auth);
  const navItems = navByRole[user?.role] || navByRole.developer;

  return <DashboardLayout navItems={navItems} />;
}