import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Users,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const ICON = "h-4 w-4";

const ADMIN_NAV_ITEMS = [
  { label: "Overview",      to: "/admin",               icon: <LayoutDashboard className={ICON} /> },
  { label: "Users",         to: "/admin/users",         icon: <Users className={ICON} /> },
  { label: "Startups",      to: "/admin/startups",      icon: <Rocket className={ICON} /> },
  { label: "Verifications", to: "/admin/verifications", icon: <ShieldCheck className={ICON} /> },
];

export default function AdminShell() {
  return <DashboardLayout navItems={ADMIN_NAV_ITEMS} />;
}