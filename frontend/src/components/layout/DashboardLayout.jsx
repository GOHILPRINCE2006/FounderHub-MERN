import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Shared shell for every authenticated, role-based dashboard.
 * `navItems`, `title`, and `topbarActions` are supplied by the route that
 * renders this layout (see Phase 14.2+), keeping this component role-agnostic.
 */
export default function DashboardLayout({ navItems, title, topbarActions, sidebarFooter }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar items={navItems} footer={sidebarFooter} />
      <div className="flex flex-1 flex-col">
        <Topbar title={title} actions={topbarActions} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}