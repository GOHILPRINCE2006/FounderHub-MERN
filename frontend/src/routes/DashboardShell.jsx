import { useSelector } from "react-redux";
import DashboardLayout from "../components/layout/DashboardLayout";
import LogoutButton from "../components/common/LogoutButton";

export default function DashboardShell() {
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { label: "Overview", to: "/dashboard" },
    { label: "Opportunities", to: "/opportunities" },
    ...(user?.role === "developer"
      ? [
          { label: "My Applications", to: "/my-applications" },
          { label: "My Tasks", to: "/my-tasks" },
        ]
      : []),
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Dashboard"
      topbarActions={<LogoutButton />}
    />
  );
}