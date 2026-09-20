import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";

const INVESTOR_NAV_ITEMS = [
  { label: "Overview", to: "/dashboard" },
  { label: "Discover Startups", to: "/investor/startups" },
  { label: "My Requests", to: "/investor/requests" },
];

export default function InvestorShell() {
  return (
    <DashboardLayout
      navItems={INVESTOR_NAV_ITEMS}
      title="Investor Dashboard"
      topbarActions={<LogoutButton />}
    />
  );
}
