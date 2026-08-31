import { NavLink } from "react-router-dom";

/**
 * Data-driven sidebar — takes a list of nav items rather than hardcoding
 * routes, so each role's dashboard (Phase 14.4+) can pass its own set
 * without this component changing.
 *
 * items: { label: string, to: string, icon?: ReactNode }[]
 */
export default function Sidebar({ items = [], footer }) {
  return (
    <aside className="flex h-screen w-60 flex-col bg-navy text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="font-display text-lg font-semibold tracking-tight">
          FoundrHub
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gold text-ink"
                  : "text-white/80 hover:bg-navy-light hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="border-t border-white/10 px-3 py-4">{footer}</div>}
    </aside>
  );
}