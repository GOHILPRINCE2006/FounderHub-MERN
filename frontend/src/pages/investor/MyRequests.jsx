import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyRequests,
  clearInvestorError,
} from "../../features/investor/investorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function MyRequests() {
  const dispatch = useDispatch();
  const { myRequests, myRequestsStatus, error } = useSelector(
    (state) => state.investor
  );

  useEffect(() => {
    dispatch(clearInvestorError());
    dispatch(fetchMyRequests());
  }, [dispatch]);

  if (
    myRequestsStatus === "idle" ||
    (myRequestsStatus === "loading" && myRequests.length === 0)
  ) {
    return <Loader label="Loading your requests" full />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">My Requests</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Connection requests you've sent to founders.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage
            message={error}
            onRetry={() => dispatch(fetchMyRequests())}
          />
        </div>
      )}

      {myRequests.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            You haven't sent any requests yet.
          </p>
          <div className="mt-3 flex justify-center">
            <Link to="/investor/startups">
              <Button variant="secondary" size="sm">
                Discover Startups
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myRequests.map((req) => (
            <Card key={req._id}>
              <div className="flex items-start gap-4">
                {req.startup?.logo ? (
                  <img
                    src={req.startup.logo}
                    alt={req.startup.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-base font-semibold text-white">
                    {req.startup?.name?.[0] || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {req.startup ? (
                      <Link
                        to={`/investor/startups/${req.startup._id}`}
                        className="font-display text-base font-semibold text-ink hover:underline"
                      >
                        {req.startup.name}
                      </Link>
                    ) : (
                      <span className="font-display text-base font-semibold text-ink">
                        Deleted startup
                      </span>
                    )}
                    <Badge status={req.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {[req.startup?.industry, req.startup?.stage]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {req.message && (
                    <p className="mt-3 rounded-lg bg-paper p-3 text-sm text-ink">
                      "{req.message}"
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted">
                    Sent {formatDate(req.createdAt)}
                    {req.status !== "Pending" &&
                      ` · Responded ${formatDate(req.updatedAt)}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}