import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentorQueue,
  acceptMentorRequest,
  declineMentorRequest,
  clearMentorError,
  completeMentorSession,
} from "../../features/mentor/mentorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Mail, Phone, Target, AlertCircle } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function FounderContact({ founder }) {
  if (!founder?.email && !founder?.phone) return null;
  return (
    <div className="mt-4 rounded-xl border border-success/30 bg-success-bg p-4 text-sm">
      <p className="font-medium text-success mb-2">Payment Received — Contact the Founder</p>
      <div className="flex flex-col gap-1.5 text-sm text-ink">
        {founder.email && (
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-success" />
            <a href={`mailto:${founder.email}`} className="hover:underline">
              {founder.email}
            </a>
          </span>
        )}
        {founder.phone && (
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-success" />
            <a href={`tel:${founder.phone}`} className="hover:underline">
              {founder.phone}
            </a>
          </span>
        )}
      </div>
    </div>
  );
}

export default function MentorQueue() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { queue, queueStatus, error } = useSelector((state) => state.mentor);
  
  const [activeTab, setActiveTab] = useState("Pending");
  const [busy, setBusy] = useState({ id: null, action: null });

  useEffect(() => {
    dispatch(clearMentorError());
    dispatch(fetchMentorQueue());
  }, [dispatch]);

  const handleAccept = async (id) => {
    setBusy({ id, action: "accept" });
    await dispatch(acceptMentorRequest(id));
    setBusy({ id: null, action: null });
  };

  const handleDecline = async (id) => {
    if (!window.confirm("Are you sure you want to decline this request?")) return;
    setBusy({ id, action: "decline" });
    await dispatch(declineMentorRequest(id));
    setBusy({ id: null, action: null });
  };

  if (queueStatus === "idle" || (queueStatus === "loading" && queue.length === 0)) {
    return <Loader label="Loading your queue" full />;
  }

  // Filter based on new database statuses
  const pending = queue.filter((r) => r.status === "Pending");
  const accepted = queue.filter((r) => r.status === "Accepted");
  const declined = queue.filter((r) => r.status === "Declined" || r.status === "Cancelled");

  const currentList = activeTab === "Pending" ? pending : activeTab === "Accepted" ? accepted : declined;

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">Mentorship Workspace</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your incoming requests, active mentorships, and session history.
        </p>
      </div>

      {!user?.isVerified && (
        <div className="mb-6 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-gold-dark">
          Your mentor account is awaiting verification. You&apos;ll start
          receiving requests once an admin approves your profile.
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => dispatch(fetchMentorQueue())} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {[
          { id: "Pending", label: "Requests", count: pending.length },
          { id: "Accepted", label: "Active Mentorships", count: accepted.length },
          { id: "Declined", label: "Archived", count: declined.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-gold text-gold-dark"
                : "border-transparent text-muted hover:border-border-strong hover:text-ink"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              activeTab === tab.id ? "bg-gold-soft text-gold-dark" : "bg-paper text-muted"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {currentList.length === 0 ? (
        <Card>
          <p className="py-12 text-center text-sm text-muted">
            No {activeTab.toLowerCase()} requests found.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {currentList.map((req) => {
            const isPending = req.status === "Pending";
            const isAccepted = req.status === "Accepted";
            const isPaid = req.paymentStatus === "Paid";

            return (
              <Card key={req._id} className="overflow-hidden">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  
                  {/* Left: Request Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between sm:justify-start gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">
                          {req.startup?.name || "Unknown Startup"}
                        </h3>
                        <p className="text-sm text-muted">
                          Requested by <span className="font-medium text-ink">{req.founder?.name}</span> on {formatDate(req.createdAt)}
                        </p>
                      </div>
                      <Badge tone={isPaid ? "success" : isAccepted ? "info" : isPending ? "warning" : "neutral"}>
                        {isPaid ? "Paid" : req.status}
                      </Badge>
                    </div>

                    <div className="rounded-xl bg-paper p-4 space-y-3">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                          <AlertCircle className="h-3.5 w-3.5" /> Challenge
                        </p>
                        <p className="text-sm text-ink">{req.challenge || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                          <Target className="h-3.5 w-3.5" /> Goals
                        </p>
                        <p className="text-sm text-ink">{req.goals || "Not specified"}</p>
                      </div>
                      {req.message && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-sm italic text-muted">"{req.message}"</p>
                        </div>
                      )}
                    </div>

                    {isPaid && <FounderContact founder={req.founder} />}
                  </div>

                  {/* Right: Actions & Price */}
                  <div className="flex flex-col gap-4 sm:w-64 sm:border-l sm:border-border sm:pl-6">
                    <div>
                      <p className="text-xs text-muted">Session Rate</p>
                      <p className="font-display text-xl font-bold text-ink">{formatINR(req.priceAtRequest)}</p>
                    </div>

                    {isPending && (
                      <div className="flex flex-col gap-2 mt-auto">
                        <Button
                          onClick={() => handleAccept(req._id)}
                          loading={busy.id === req._id && busy.action === "accept"}
                          disabled={busy.id === req._id && busy.action === "decline"}
                        >
                          Accept Request
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-danger hover:bg-danger-bg"
                          onClick={() => handleDecline(req._id)}
                          loading={busy.id === req._id && busy.action === "decline"}
                          disabled={busy.id === req._id && busy.action === "accept"}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {isAccepted && !isPaid && (
                      <div className="mt-auto rounded-lg bg-warning-bg p-3 text-center text-xs text-gold-dark">
                        Waiting for the founder to complete payment.
                      </div>
                    )}

                                        {isPaid && req.sessionStatus !== "Completed" && (
                      <div className="mt-auto flex flex-col gap-2">
                        <div className="rounded-lg bg-success-bg p-3 text-center text-xs text-success font-medium">
                          Paid — Ready for session
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if(window.confirm("Mark this session as completed? This will unlock the founder's ability to request you again.")) {
                              dispatch(completeMentorSession(req._id));
                            }
                          }}
                        >
                          Mark as Completed
                        </Button>
                      </div>
                    )}

                    {req.sessionStatus === "Completed" && (
                      <div className="mt-auto rounded-lg bg-navy/10 p-3 text-center text-xs text-navy font-medium">
                        Session Completed
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}