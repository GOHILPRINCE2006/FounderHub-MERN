import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentors,
  fetchReceivedFeedback,
  requestFeedback,
  clearMentorError,
} from "../../features/mentor/mentorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

function Avatar({ user }) {
  return user?.avatar ? (
    <img src={user.avatar} alt={user.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
      {user?.name?.[0] || "?"}
    </div>
  );
}

export default function MentorFeedback() {
  const dispatch = useDispatch();
  const { mentors, mentorsStatus, received, receivedStatus, error } = useSelector(
    (state) => state.mentor
  );
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    dispatch(clearMentorError());
    dispatch(fetchMentors());
    dispatch(fetchReceivedFeedback());
  }, [dispatch]);

  // A mentor with a still-open request can't be asked again (the backend
  // would happily create a duplicate). Derived from server data, so it
  // survives a page refresh.
  const pendingMentorIds = new Set(
    received.filter((f) => f.status === "Requested").map((f) => f.mentor?._id)
  );

  const handleRequest = async (mentorId) => {
    setRequestingId(mentorId);
    await dispatch(requestFeedback(mentorId));
    setRequestingId(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">Mentors</h1>
      <p className="mb-6 text-sm text-muted">
        Ask a verified mentor to review your startup and leave feedback.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Requests already sent + feedback received */}
      {(received.length > 0 || receivedStatus === "loading") && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Your requests</h2>
          {receivedStatus === "loading" && received.length === 0 ? (
            <Loader label="Loading your requests" />
          ) : (
            <div className="flex flex-col gap-3">
              {received.map((item) => (
                <Card key={item._id}>
                  <div className="flex items-start gap-4">
                    <Avatar user={item.mentor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold text-ink">
                          {item.mentor?.name || "Unknown mentor"}
                        </h3>
                        <Badge tone={item.status === "Reviewed" ? "success" : "warning"}>
                          {item.status === "Reviewed" ? "Feedback received" : "Awaiting feedback"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">
                        Requested {formatDate(item.createdAt)}
                        {item.status === "Reviewed" && ` · Reviewed ${formatDate(item.updatedAt)}`}
                      </p>
                      {item.status === "Reviewed" && item.feedbackText && (
                        <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-paper p-3 text-sm text-ink">
                          {item.feedbackText}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Browse verified mentors */}
      <section>
        <h2 className="mb-3 font-display text-base font-semibold text-ink">Verified mentors</h2>
        {mentorsStatus === "loading" && mentors.length === 0 ? (
          <Loader label="Loading mentors" />
        ) : mentors.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-muted">No verified mentors available yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {mentors.map((mentor) => {
              const isPending = pendingMentorIds.has(mentor._id);
              return (
                <Card key={mentor._id}>
                  <div className="flex items-start gap-4">
                    <Avatar user={mentor} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold text-ink">{mentor.name}</h3>
                      {mentor.experience && (
                        <p className="text-sm text-muted">{mentor.experience}</p>
                      )}
                      {mentor.about && <p className="mt-2 text-sm text-ink">{mentor.about}</p>}
                      {mentor.skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {mentor.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isPending ? "outline" : "primary"}
                      disabled={isPending}
                      loading={requestingId === mentor._id}
                      onClick={() => handleRequest(mentor._id)}
                    >
                      {isPending ? "Requested" : "Request feedback"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
