import { useEffect, useMemo, useState } from "react";
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
import { Search } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function Avatar({ user, size = "md" }) {
  const dim = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className={`${dim} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white`}
    >
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
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(clearMentorError());
    dispatch(fetchMentors());
    dispatch(fetchReceivedFeedback());
  }, [dispatch]);

  const pendingMentorIds = new Set(
    received.filter((f) => f.status === "Requested").map((f) => f.mentor?._id)
  );

  const handleRequest = async (mentorId) => {
    setRequestingId(mentorId);
    await dispatch(requestFeedback(mentorId));
    setRequestingId(null);
  };

  // Client-side search across name, expertise, skills, company, role.
  const filteredMentors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter((m) => {
      const hay = [
        m.name,
        m.expertise,
        m.currentRole,
        m.company,
        m.about,
        m.experience,
        ...(m.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [mentors, query]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">Mentors</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Browse verified mentors, review their background, and request feedback on your startup.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Your requests (if any) */}
      {received.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">
            Your requests
          </h2>
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
                      <Badge
                        tone={item.status === "Reviewed" ? "success" : "warning"}
                      >
                        {item.status === "Reviewed"
                          ? "Feedback received"
                          : "Awaiting feedback"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      Requested {formatDate(item.createdAt)}
                      {item.status === "Reviewed" &&
                        ` · Reviewed ${formatDate(item.updatedAt)}`}
                    </p>
                    {item.status === "Reviewed" && item.feedbackText && (
                      <p className="mt-3 rounded-lg bg-paper p-3 text-sm text-ink">
                        {item.feedbackText}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Browse verified mentors */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-ink">
            Browse verified mentors
            {mentorsStatus === "succeeded" && mentors.length > 0 && (
              <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs font-normal text-muted">
                {mentors.length}
              </span>
            )}
          </h2>
        </div>

        {/* Search box */}
        {mentors.length > 0 && (
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, expertise, or company"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </div>
        )}

        {mentorsStatus === "loading" && mentors.length === 0 ? (
          <Loader label="Loading mentors" />
        ) : mentors.length === 0 ? (
          <Card>
            <div className="py-6 text-center">
              <p className="text-sm text-ink">No verified mentors yet.</p>
              <p className="mt-1 text-xs text-muted">
                Mentors are verified by an admin before appearing here. Check
                back once mentors have signed up and been approved.
              </p>
            </div>
          </Card>
        ) : filteredMentors.length === 0 ? (
          <Card>
            <p className="py-4 text-center text-sm text-muted">
              No mentors match "{query}".
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMentors.map((mentor) => {
              const isPending = pendingMentorIds.has(mentor._id);
              return (
                <Card key={mentor._id}>
                  <div className="flex items-start gap-4">
                    <Avatar user={mentor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold text-ink">
                          {mentor.name}
                        </h3>
                        {mentor.yearsOfExperience > 0 && (
                          <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-gold-dark">
                            {mentor.yearsOfExperience}+ years
                          </span>
                        )}
                      </div>

                      {(mentor.currentRole || mentor.company) && (
                        <p className="mt-0.5 text-sm text-ink">
                          {mentor.currentRole}
                          {mentor.currentRole && mentor.company && " at "}
                          {mentor.company && (
                            <span className="font-medium">{mentor.company}</span>
                          )}
                        </p>
                      )}

                      {mentor.expertise && (
                        <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                          Expertise: {mentor.expertise}
                        </p>
                      )}

                      {mentor.experience && (
                        <p className="mt-1 text-sm text-muted">{mentor.experience}</p>
                      )}

                      {mentor.about && (
                        <p className="mt-2 text-sm text-ink">{mentor.about}</p>
                      )}

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

                      {mentor.linkedin && (
                        <a
                          href={
                            mentor.linkedin.startsWith("http")
                              ? mentor.linkedin
                              : `https://${mentor.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-medium text-gold-dark hover:underline"
                        >
                          View LinkedIn →
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isPending ? "outline" : "primary"}
                      disabled={isPending}
                      loading={requestingId === mentor._id}
                      onClick={() => handleRequest(mentor._id)}
                    >
                      {isPending ? "Requested" : "Request"}
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