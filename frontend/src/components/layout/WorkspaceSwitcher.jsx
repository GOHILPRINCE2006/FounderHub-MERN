import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronDown, Plus, Rocket } from "lucide-react";

const isCreatePath = (pathname) => /^\/founder\/create(\/|$)/.test(pathname);

const getStartupIdFromPath = (pathname) => {
  const m = pathname.match(/^\/founder\/([^/]+)/);
  if (!m || m[1] === "create") return null;
  return m[1];
};

export default function WorkspaceSwitcher() {
  const { myStartups } = useSelector((state) => state.startup);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const isCreatePage = isCreatePath(pathname);
  const startupId = getStartupIdFromPath(pathname);
  const activeStartup = myStartups.find((s) => s._id === startupId);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = isCreatePage
    ? "New Workspace"
    : activeStartup?.name || "Select startup";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
      >
        <Rocket className="h-4 w-4 text-gold" />
        <span className="max-w-[150px] truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-1 shadow-lg">
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Your Startups
          </div>
          {myStartups.map((s) => (
            <button
              key={s._id}
              onClick={() => {
                setOpen(false);
                navigate(`/founder/${s._id}/dashboard`);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                s._id === startupId
                  ? "bg-gold/10 font-medium text-gold-dark"
                  : "text-ink hover:bg-paper"
              }`}
            >
              <span className="truncate">{s.name}</span>
            </button>
          ))}
          <div className="my-1 border-t border-border" />
          <Link
            to="/founder/create"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gold-dark hover:bg-paper"
          >
            <Plus className="h-4 w-4" />
            Create new startup
          </Link>
        </div>
      )}
    </div>
  );
}