import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyApplications } from "../../features/application/applicationSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function MyApplications() {
  const dispatch = useDispatch();
  const { myApplications, fetchStatus, error } = useSelector(
    (state) => state.application
  );

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  if (fetchStatus === "loading") {
    return <Loader label="Loading your applications" full />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        My Applications
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Track the status of roles you've applied to.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {myApplications.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            You haven't applied to any roles yet.
          </p>
          <div className="mt-3 flex justify-center">
            <Link to="/opportunities">
              <Button variant="secondary" size="sm">
                Browse Opportunities
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myApplications.map((app) => (
            <Card key={app._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-ink">
                    {app.recruitmentPost?.roleTitle}
                  </h3>
                  <p className="text-sm text-muted">
                    {app.startup?.name}
                    {app.startup?.industry && ` · ${app.startup.industry}`}
                  </p>
                </div>
                <Badge status={app.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}