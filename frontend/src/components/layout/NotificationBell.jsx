import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  markNotificationRead,
  markAllNotificationsRead,
  selectUnreadCount,
} from "../../features/notification/notificationSlice";
import { getNotificationRoute } from "../../features/notification/notificationRoutes";

const MAX_VISIBLE = 30;

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.notification);
  const unreadCount = useSelector(selectUnreadCount);

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleOpenNotification = (notification) => {
    if (!notification.isRead) dispatch(markNotificationRead(notification._id));
    setOpen(false);
    navigate(getNotificationRoute(notification, user?.role));
  };

  const visible = items.slice(0, MAX_VISIBLE);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="text-xs font-medium text-gold-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {status === "loading" && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Loading...</p>
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              <ul>
                {visible.map((n) => (
                  <li key={n._id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-paper focus:outline-none focus-visible:bg-paper ${
                        n.isRead ? "" : "bg-warning-bg/40"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.isRead ? "bg-transparent" : "bg-gold"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block break-words text-sm ${
                            n.isRead ? "text-muted" : "text-ink"
                          }`}
                        >
                          {n.message}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > MAX_VISIBLE && (
            <p className="border-t border-border px-4 py-2 text-center text-xs text-muted">
              Showing your latest {MAX_VISIBLE} notifications
            </p>
          )}
        </div>
      )}
    </div>
  );
}
