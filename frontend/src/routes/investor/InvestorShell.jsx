import DashboardLayout from "../../components/layout/DashboardLayout";
import { LayoutDashboard, Compass, Banknote, Send } from "lucide-react";

const ICON = "h-4 w-4";

const INVESTOR_NAV_ITEMS = [
  { label: "Overview",          to: "/dashboard",         icon: <LayoutDashboard className={ICON} /> },
  { label: "Discover Startups", to: "/investor/startups", icon: <Compass className={ICON} /> },
  { label: "Funding",           to: "/investor/funding",  icon: <Banknote className={ICON} /> },
  { label: "My Requests",       to: "/investor/requests", icon: <Send className={ICON} /> },
];

export default function InvestorShell() {
  return <DashboardLayout navItems={INVESTOR_NAV_ITEMS} />;
}