import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";

const FOUNDER_NAV_ITEMS = [
  { label: "Overview", to: "/dashboard" },
  { label: "My Startup", to: "/founder/startup" },
  { label: "Recruitment", to: "/founder/recruitment" },
];

export default function FounderShell() {
  return (
    <DashboardLayout
      navItems={FOUNDER_NAV_ITEMS}
      title="Founder Dashboard"
      topbarActions={<LogoutButton />}
    />
  );
}