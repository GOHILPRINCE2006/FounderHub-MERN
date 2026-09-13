import DashboardLayout from "../components/layout/DashboardLayout";
import LogoutButton from "../components/common/LogoutButton";

// Temporary shell for Phase 14.2 testing only — real per-role navItems
// and titles get built starting Phase 14.4.
export default function DashboardShell() {
  return (
    <DashboardLayout
      navItems={[{ label: "Home", to: "/dashboard" }]}
      title="Dashboard"
      topbarActions={<LogoutButton />}
    />
  );
}