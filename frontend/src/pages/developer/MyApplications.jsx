import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyApplications } from "../../features/application/applicationSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function MyApplications() {
  const dispatch = useDispatch();
  const { myApplications, fetchStatus, error } = useSelector((state) => state.application);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  if (fetchStatus === "loading") {
    return <Loader label="Loading your applications" full />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">
        My Applications
      </h1>
      <p className="mb-6 text-sm text-muted">
        Track the status of roles you've applied to.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {myApplications.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">
            You haven't applied to any roles yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myApplications.map((app) => (
            <Card key={app._id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {app.recruitmentPost?.roleTitle}
                  </h3>
                  <p className="text-sm text-muted">
                    {app.startup?.name} · {app.startup?.industry}
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