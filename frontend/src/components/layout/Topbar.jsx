import { NavLink, Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import NotificationBell from "./NotificationBell";
import AvatarMenu from "./AvatarMenu";

export default function Topbar({ navItems = [] }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-navy text-white">
      <div className="flex h-16 items-center gap-6 px-6 sm:px-8">        {/* Brand */}
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold">
            <Rocket className="h-4 w-4 text-ink" strokeWidth={2.4} />
          </span>
          <span className="hidden font-display text-base font-semibold tracking-tight sm:inline">
            Founder<span className="text-gold">Hub</span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-gold font-medium text-ink"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-1.5">
          <NotificationBell />
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}