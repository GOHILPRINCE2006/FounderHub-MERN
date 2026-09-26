import DashboardLayout from "../../components/layout/DashboardLayout";
import { LayoutDashboard, GraduationCap } from "lucide-react";

const ICON = "h-4 w-4";

const MENTOR_NAV_ITEMS = [
  { label: "Overview",       to: "/dashboard",    icon: <LayoutDashboard className={ICON} /> },
  { label: "Feedback Queue", to: "/mentor/queue", icon: <GraduationCap className={ICON} /> },
];

export default function MentorShell() {
  return <DashboardLayout navItems={MENTOR_NAV_ITEMS} />;
}