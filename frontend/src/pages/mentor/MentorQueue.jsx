import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentorQueue,
  submitFeedback,
  clearMentorError,
} from "../../features/mentor/mentorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonList } from "../../components/common/Skeleton";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function FeedbackForm({ requestId }) {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await dispatch(
        submitFeedback({ id: requestId, feedbackText: text })
      ).unwrap();
    } catch (message) {
      setFormError(typeof message === "string" ? message : "Failed to submit");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <Textarea
        name={`feedback-${requestId}`}
        label="Your feedback"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's strong, what's risky, and what would you do next?"
        error={formError}
      />
      <div>
        <Button type="submit" size="sm" loading={submitting} disabled={!text.trim()}>
          Submit feedback
        </Button>
      </div>
    </form>
  );
}

function RequestCard({ request }) {
  const { startup, requestedBy } = request;
  const isReviewed = request.status === "Reviewed";

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-base font-semibold text-ink">
          {startup?.name || "Deleted startup"}
        </h3>
        <Badge tone={isReviewed ? "success" : "warning"}>
          {isReviewed ? "Reviewed" : "Awaiting feedback"}
        </Badge>
      </div>
      <p className="text-xs text-muted">
        {[startup?.industry, startup?.stage].filter(Boolean).join(" · ")}
      </p>
      {startup?.description && (
        <p className="mt-2 text-sm text-ink">{startup.description}</p>
      )}
      <p className="mt-2 text-xs text-muted">
        Requested by {requestedBy?.name || "a founder"} on{" "}
        {formatDate(request.createdAt)}
      </p>

      {isReviewed ? (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-muted">
            Your feedback · {formatDate(request.updatedAt)}
          </p>
          <p className="rounded-lg bg-paper p-3 text-sm text-ink">
            {request.feedbackText}
          </p>
        </div>
      ) : (
        <FeedbackForm requestId={request._id} />
      )}
    </Card>
  );
}

export default function MentorQueue() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { queue, queueStatus, error } = useSelector((state) => state.mentor);

  useEffect(() => {
    dispatch(clearMentorError());
    dispatch(fetchMentorQueue());
  }, [dispatch]);

  if (queueStatus === "idle" || (queueStatus === "loading" && queue.length === 0)) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-xl font-semibold text-ink">
          Feedback Queue
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Startups whose founders asked for your feedback.
        </p>
        <SkeletonList count={3} withAvatar={false} />
      </div>
    );
  }

  const pending = queue.filter((r) => r.status === "Requested");
  const completed = queue.filter((r) => r.status === "Reviewed");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Feedback Queue
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Startups whose founders asked for your feedback.
      </p>

      {!user?.isVerified && (
        <div className="mb-4 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-gold-dark">
          Your mentor account is awaiting verification.
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorMessage
            message={error}
            onRetry={() => dispatch(fetchMentorQueue())}
          />
        </div>
      )}

      {queue.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No feedback requests yet.
          </p>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Awaiting your feedback ({pending.length})
              </h2>
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <RequestCard key={r._id} request={r} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Completed ({completed.length})
              </h2>
              <div className="flex flex-col gap-3">
                {completed.map((r) => (
                  <RequestCard key={r._id} request={r} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}