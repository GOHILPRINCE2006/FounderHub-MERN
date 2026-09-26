import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceivedRequests,
  respondToRequest,
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

export default function InvestorRequests() {
  const dispatch = useDispatch();
  const { received, receivedStatus, error } = useSelector(
    (state) => state.investor
  );
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    dispatch(clearInvestorError());
    dispatch(fetchReceivedRequests());
  }, [dispatch]);

  const handleRespond = async (id, decision) => {
    setResponding({ id, decision });
    await dispatch(respondToRequest({ id, decision }));
    setResponding(null);
  };

  if (
    receivedStatus === "idle" ||
    (receivedStatus === "loading" && received.length === 0)
  ) {
    return <Loader label="Loading investor requests" full />;
  }

  const isBusy = (id, decision) =>
    responding?.id === id && responding?.decision === decision;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Investor Requests
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Investors who want to connect with your startup.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {received.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No investor requests yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {received.map((req) => (
            <Card key={req._id}>
              <div className="flex items-start gap-4">
                {req.investor?.avatar ? (
                  <img
                    src={req.investor.avatar}
                    alt={req.investor.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                    {req.investor?.name?.[0] || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {req.investor?.name || "Unknown investor"}
                    </h3>
                    <Badge status={req.status} />
                  </div>
                  <p className="text-sm text-muted">{req.investor?.email}</p>
                  {req.investor?.about && (
                    <p className="mt-1 text-sm text-ink">{req.investor.about}</p>
                  )}
                  {req.message && (
                    <p className="mt-3 rounded-lg bg-paper p-3 text-sm text-ink">
                      "{req.message}"
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted">
                    Received {formatDate(req.createdAt)}
                    {req.status !== "Pending" &&
                      ` · Responded ${formatDate(req.updatedAt)}`}
                  </p>

                  {req.status === "Pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        loading={isBusy(req._id, "accept")}
                        disabled={responding?.id === req._id}
                        onClick={() => handleRespond(req._id, "accept")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={isBusy(req._id, "reject")}
                        disabled={responding?.id === req._id}
                        onClick={() => handleRespond(req._id, "reject")}
                      >
                        Decline
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