import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApplicationsForPost,
  acceptApplication,
  rejectApplication,
} from "../../features/application/applicationSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  ArrowLeft, Mail, Phone, MapPin, Code2, Briefcase, Globe,
} from "lucide-react";

export default function ApplicationReview() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { byPostId, reviewStatus, actionStatus, error } = useSelector(
    (state) => state.application
  );

  const applications = byPostId[postId] || [];

  useEffect(() => {
    dispatch(fetchApplicationsForPost(postId));
  }, [dispatch, postId]);

  if (reviewStatus === "loading" && applications.length === 0) {
    return <Loader label="Loading applications" full />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/founder/recruitment"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>

      <h1 className="font-display text-xl font-semibold text-ink">Applications</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Review and respond to applicants for this role.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No applications for this post yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const a = app.applicant || {};

            // Links that exist, pre-normalized to https://
            const links = [
              a.github && {
                icon: Code2,
                label: "GitHub",
                href: a.github.startsWith("http") ? a.github : `https://${a.github}`,
              },
              a.linkedin && {
                icon: Briefcase,
                label: "LinkedIn",
                href: a.linkedin.startsWith("http") ? a.linkedin : `https://${a.linkedin}`,
              },
              a.website && {
                icon: Globe,
                label: "Website",
                href: a.website.startsWith("http") ? a.website : `https://${a.website}`,
              },
            ].filter(Boolean);

            return (
              <Card key={app._id}>
                <div className="flex items-start gap-4">
                  {a.avatar ? (
                    <img
                      src={a.avatar}
                      alt={a.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-base font-semibold text-white">
                      {a.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Name + status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {a.name || "Unknown applicant"}
                      </h3>
                      <Badge status={app.status} />
                      {a.availability && (
                        <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-gold-dark">
                          {a.availability}
                        </span>
                      )}
                    </div>

                    {/* Contact info */}
                    <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted">
                      {a.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${a.email}`} className="hover:text-ink">
                            {a.email}
                          </a>
                        </span>
                      )}
                      {a.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${a.phone}`} className="hover:text-ink">
                            {a.phone}
                          </a>
                        </span>
                      )}
                      {a.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {a.location}
                        </span>
                      )}
                    </div>

                    {/* Experience */}
                    {a.experience && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">
                          Experience
                        </p>
                        <p className="mt-0.5 text-sm text-ink">{a.experience}</p>
                      </div>
                    )}

                    {/* About */}
                    {a.about && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">
                          About
                        </p>
                        <p className="mt-0.5 text-sm text-ink">{a.about}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {a.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    {links.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {links.map((l) => (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-border-strong"
                          >
                            <l.icon className="h-3.5 w-3.5 text-muted" />
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Cover message */}
                    {app.coverMessage && (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                          Cover message
                        </p>
                        <p className="rounded-lg bg-paper p-3 text-sm text-ink">
                          {app.coverMessage}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === "Pending" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          loading={actionStatus === "loading"}
                          onClick={() => dispatch(acceptApplication(app._id))}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={actionStatus === "loading"}
                          onClick={() => dispatch(rejectApplication(app._id))}
                        >
                          Reject
                        </Button>
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