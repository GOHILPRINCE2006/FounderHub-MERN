import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentorQueue,
  acceptMentorRequest,
  declineMentorRequest,
  clearMentorError,
} from "../../features/mentor/mentorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Mail, Phone } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function FounderContact({ founder }) {
  if (!founder?.email && !founder?.phone) return null;
  return (
    <div className="mt-3 rounded-lg border border-success/40 bg-success-bg p-3 text-sm">
      <p className="font-medium text-success">Paid — reach out to arrange the meeting</p>
      <div className="mt-1.5 flex flex-col gap-1 text-xs text-ink">
        {founder.email && (
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <a href={`mailto:${founder.email}`} className="hover:underline">
              {founder.email}
            </a>
          </span>
        )}
        {founder.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <a href={`tel:${founder.phone}`} className="hover:underline">
              {founder.phone}
            </a>
          </span>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, busy, onAccept, onDecline }) {
  const { startup, requestedBy, status } = request;
  const isPending = status === "Requested";
  const isPaid = status === "Paid";

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-base font-semibold text-ink">
          {startup?.name || "Deleted startup"}
        </h3>
        <Badge
          tone={
            isPaid
              ? "success"
              : status === "Accepted"
              ? "info"
              : status === "Declined"
              ? "danger"
              : "warning"
          }
        >
          {status}
        </Badge>
      </div>

      <p className="text-xs text-muted">
        {[startup?.industry, startup?.stage].filter(Boolean).join(" · ")}
      </p>
      {startup?.tagline && (
        <p className="mt-1 text-sm text-ink">{startup.tagline}</p>
      )}

      <p className="mt-2 text-xs text-muted">
        Requested by <span className="font-medium text-ink">{requestedBy?.name || "a founder"}</span>{" "}
        on {formatDate(request.createdAt)}
      </p>

      {request.message && (
        <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
          "{request.message}"
        </p>
      )}

      {isPaid && <FounderContact founder={requestedBy} />}

      {isPending && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            loading={busy === "accept"}
            disabled={busy === "decline"}
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={busy === "decline"}
            disabled={busy === "accept"}
            onClick={onDecline}
          >
            Decline
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function MentorQueue() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { queue, queueStatus, error } = useSelector((state) => state.mentor);
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
    setBusy({ id, action: "decline" });
    await dispatch(declineMentorRequest(id));
    setBusy({ id: null, action: null });
  };

  if (queueStatus === "idle" || (queueStatus === "loading" && queue.length === 0)) {
    return <Loader label="Loading your queue" full />;
  }

  const pending = queue.filter((r) => r.status === "Requested");
  const accepted = queue.filter((r) => r.status === "Accepted");
  const paid = queue.filter((r) => r.status === "Paid");
  const resolved = queue.filter((r) => r.status === "Declined");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">Mentorship Requests</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Founders who want to book a session with you. Accept or decline each request.
      </p>

      {!user?.isVerified && (
        <div className="mb-4 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-gold-dark">
          Your mentor account is awaiting verification. You&apos;ll start
          receiving requests once an admin approves your profile.
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => dispatch(fetchMentorQueue())} />
        </div>
      )}

      {queue.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No requests yet.
          </p>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Awaiting your response ({pending.length})
              </h2>
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <RequestCard
                    key={r._id}
                    request={r}
                    busy={busy.id === r._id ? busy.action : null}
                    onAccept={() => handleAccept(r._id)}
                    onDecline={() => handleDecline(r._id)}
                  />
                ))}
              </div>
            </section>
          )}

          {accepted.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Waiting for payment ({accepted.length})
              </h2>
              <div className="flex flex-col gap-3">
                {accepted.map((r) => <RequestCard key={r._id} request={r} />)}
              </div>
            </section>
          )}

          {paid.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Confirmed sessions ({paid.length})
              </h2>
              <div className="flex flex-col gap-3">
                {paid.map((r) => <RequestCard key={r._id} request={r} />)}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Declined ({resolved.length})
              </h2>
              <div className="flex flex-col gap-3">
                {resolved.map((r) => <RequestCard key={r._id} request={r} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}