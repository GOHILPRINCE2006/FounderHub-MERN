import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";

const MENTOR_NAV_ITEMS = [
  { label: "Overview", to: "/dashboard" },
  { label: "Feedback Queue", to: "/mentor/queue" },
];

export default function MentorShell() {
  return (
    <DashboardLayout
      navItems={MENTOR_NAV_ITEMS}
      title="Mentor Dashboard"
      topbarActions={<LogoutButton />}
    />
  );
}
