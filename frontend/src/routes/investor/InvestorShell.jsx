import DashboardLayout from "../../components/layout/DashboardLayout";
import { LayoutDashboard, Banknote } from "lucide-react";

const ICON = "h-4 w-4";

const INVESTOR_NAV_ITEMS = [
  { label: "Overview", to: "/dashboard", icon: <LayoutDashboard className={ICON} /> },
  { label: "Requests", to: "/investor/requests", icon: <Banknote className={ICON} /> },
];

export default function InvestorShell() {
  return <DashboardLayout navItems={INVESTOR_NAV_ITEMS} />;
}