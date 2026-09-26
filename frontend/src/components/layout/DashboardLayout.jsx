import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

export default function DashboardLayout({ navItems }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Topbar navItems={navItems} />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}