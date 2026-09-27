import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceivedFundingRequests,
  respondToFundingRequest,
  clearFundingError,
} from "../../features/funding/fundingSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { IndianRupee } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

export default function FundingRequests() {
  const dispatch = useDispatch();
  const { received, receivedStatus, error } = useSelector(
    (state) => state.funding
  );
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    dispatch(clearFundingError());
    dispatch(fetchReceivedFundingRequests());
  }, [dispatch]);

  const handleRespond = async (id, decision) => {
    setResponding({ id, decision });
    await dispatch(respondToFundingRequest({ id, decision }));
    setResponding(null);
  };

  if (
    receivedStatus === "idle" ||
    (receivedStatus === "loading" && received.length === 0)
  ) {
    return <Loader label="Loading funding requests" full />;
  }

  const isBusy = (id, decision) =>
    responding?.id === id && responding?.decision === decision;

  const pending = received.filter((r) => r.status === "Pending");
  const resolved = received.filter((r) => r.status !== "Pending");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Funding Requests
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Startups that have asked you to fund them.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {received.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No funding requests yet.
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
                    isBusy={isBusy}
                    onRespond={handleRespond}
                  />
                ))}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Past requests
              </h2>
              <div className="flex flex-col gap-3">
                {resolved.map((r) => (
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

function RequestCard({ request, isBusy, onRespond }) {
  const { startup, founder } = request;

  return (
    <Card>
      <div className="flex items-start gap-4">
        {startup?.logo ? (
          <img
            src={startup.logo}
            alt={startup.name}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-base font-semibold text-white">
            {startup?.name?.[0] || "?"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">
              {startup?.name || "Unknown startup"}
            </h3>
            <Badge status={request.status} />
            {startup?.stage && <Badge status={startup.stage} />}
          </div>
          {startup?.tagline && (
            <p className="mt-0.5 text-sm text-muted">{startup.tagline}</p>
          )}
          {founder?.name && (
            <p className="text-xs text-muted">
              by {founder.name}
              {founder.company ? ` · ${founder.company}` : ""}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1 font-medium text-ink">
              <IndianRupee className="h-3.5 w-3.5" />
              {formatINR(request.amount)}
            </span>
            <span className="text-muted">
              for <span className="font-medium text-ink">{request.equityOffered}%</span> equity
            </span>
          </div>

          <p className="mt-2 text-sm text-ink">{request.purpose}</p>

          {request.message && (
            <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
              "{request.message}"
            </p>
          )}

          <p className="mt-2 text-xs text-muted">
            Received {formatDate(request.createdAt)}
            {request.respondedAt && ` · Responded ${formatDate(request.respondedAt)}`}
          </p>

          {onRespond && request.status === "Pending" && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                loading={isBusy(request._id, "accept")}
                disabled={isBusy(request._id, "decline")}
                onClick={() => onRespond(request._id, "accept")}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={isBusy(request._id, "decline")}
                disabled={isBusy(request._id, "accept")}
                onClick={() => onRespond(request._id, "decline")}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}