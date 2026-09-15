import { useEffect } from "react";
import { useParams } from "react-router-dom";
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
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">
        Applications
      </h1>
      <p className="mb-6 text-sm text-muted">
        Review and respond to applicants for this role.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">
            No applications for this post yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app._id}>
              <div className="flex items-start gap-4">
                {app.applicant?.avatar ? (
                  <img
                    src={app.applicant.avatar}
                    alt={app.applicant.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                    {app.applicant?.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {app.applicant?.name}
                    </h3>
                    <Badge status={app.status} />
                  </div>
                  <p className="text-sm text-muted">{app.applicant?.email}</p>
                  {app.applicant?.skills?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {app.applicant.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {app.coverMessage && (
                    <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-ink">
                      "{app.coverMessage}"
                    </p>
                  )}

                  {app.status === "Pending" && (
                    <div className="mt-3 flex gap-2">
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
          ))}
        </div>
      )}
    </div>
  );
}