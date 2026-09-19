import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyTeams } from "../../features/chat/chatSlice";
import useTeamChat from "../../features/chat/useTeamChat";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const CONNECTION_BADGE = {
  connected: { tone: "success", label: "Live" },
  connecting: { tone: "warning", label: "Connecting..." },
  disconnected: { tone: "danger", label: "Offline" },
};

function formatTimestamp(iso) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

// Shared by founders and team members — the backend decides access per
// startup, so both roles render this same page (at different routes, inside
// their own shell).
export default function TeamChat() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { teams, teamsStatus, messages, historyStatus, connectionStatus, error } =
    useSelector((state) => state.chat);

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyTeams());
  }, [dispatch]);

  // Default to the first team until the user picks another one.
  const activeId = selectedId || teams[0]?._id || null;
  const { sendMessage } = useTeamChat(activeId);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sendMessage(draft)) setDraft("");
  };

  if (teamsStatus === "idle" || teamsStatus === "loading") {
    return <Loader label="Loading your teams" full />;
  }

  if (teams.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-display text-xl font-semibold text-ink">Team Chat</h1>
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onRetry={() => dispatch(fetchMyTeams())} />
          </div>
        )}
        <Card>
          <p className="text-center text-sm text-muted">
            {user?.role === "founder"
              ? "Create your startup to open a team chat."
              : "You'll get a team chat once a founder accepts your application."}
          </p>
          <div className="mt-4 flex justify-center">
            <Link to={user?.role === "founder" ? "/founder/startup" : "/opportunities"}>
              <Button variant="secondary" size="sm">
                {user?.role === "founder" ? "Go to My Startup" : "Browse Opportunities"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const activeTeam = teams.find((t) => t._id === activeId);
  const badge = CONNECTION_BADGE[connectionStatus];
  const canSend = connectionStatus === "connected" && draft.trim().length > 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Team Chat</h1>
          <p className="text-sm text-muted">{activeTeam?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {teams.length > 1 && (
            <select
              value={activeId}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Choose team"
              className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </div>

      {error && (
        <div className="mb-3">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-surface shadow-sm">
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {historyStatus === "loading" && <Loader label="Loading messages" />}

          {historyStatus === "succeeded" && messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              No messages yet. Say hello to your team.
            </p>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender?._id === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    isMine ? "bg-navy text-white" : "border border-border bg-paper text-ink"
                  }`}
                >
                  {!isMine && (
                    <p className="mb-0.5 text-xs font-medium text-gold-dark">
                      {msg.sender?.name || "Unknown user"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`mt-1 text-right text-[11px] ${
                      isMine ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {formatTimestamp(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              connectionStatus === "connected" ? "Write a message..." : "Waiting for connection..."
            }
            aria-label="Message"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          />
          <Button type="submit" disabled={!canSend}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
