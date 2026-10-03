import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifiedInvestors,
  fetchMyInvestmentRequests,
  sendInvestmentRequest,
  withdrawInvestmentRequest,
  clearInvestorError,
} from "../../features/investor/investorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Search, IndianRupee, Mail, Phone, X } from "lucide-react";

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

function Avatar({ user }) {
  return user?.avatar ? (
    <img src={user.avatar} alt={user.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-base font-semibold text-white">
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function RequestModal({ investor, onClose }) {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [equity, setEquity] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr(null);
    try {
      await dispatch(
        sendInvestmentRequest({
          investorId: investor._id,
          message,
          proposedAmount: Number(amount),
          proposedEquity: Number(equity),
        })
      ).unwrap();
      onClose();
    } catch (m) {
      setErr(typeof m === "string" ? m : "Failed to send request");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-base font-semibold text-ink">
            Request funding from {investor.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-paper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount seeking (INR) *"
              type="number"
              min={1}
              placeholder="e.g. 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input
              label="Equity offered (%) *"
              type="number"
              step="0.01"
              min={0.01}
              max={100}
              placeholder="e.g. 5"
              value={equity}
              onChange={(e) => setEquity(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Message (optional)"
            rows={4}
            placeholder="Briefly explain what you're raising for."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={err}
          />

          <p className="text-xs text-muted">
            The investor can accept, decline, or contact you to negotiate terms. You pay nothing at this step.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={sending}>
              Send request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyRequestCard({ request }) {
  const dispatch = useDispatch();
  const investor = request.investor;
  const isAccepted = request.status === "Accepted";
  const isInvested = request.status === "Invested";
  const canWithdraw = request.status === "Requested" || request.status === "Accepted";

  return (
    <Card>
      <div className="flex items-start gap-4">
        <Avatar user={investor} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">
              {investor?.name || "Unknown investor"}
            </h3>
            <Badge
              tone={
                isInvested
                  ? "success"
                  : isAccepted
                  ? "info"
                  : request.status === "Declined"
                  ? "danger"
                  : request.status === "Withdrawn"
                  ? "neutral"
                  : "warning"
              }
            >
              {request.status}
            </Badge>
          </div>
          {investor?.company && <p className="text-xs text-muted">{investor.company}</p>}

          <p className="mt-2 text-sm text-ink">
            Proposed: <span className="font-medium">{formatINR(request.proposedAmount)}</span> for{" "}
            <span className="font-medium">{request.proposedEquity}%</span> equity
          </p>
          {isInvested && (
            <p className="mt-1 text-sm text-success">
              Final: <span className="font-medium">{formatINR(request.finalAmount)}</span> for{" "}
              <span className="font-medium">{request.finalEquity}%</span> equity
            </p>
          )}

          {request.message && (
            <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
              "{request.message}"
            </p>
          )}

          <p className="mt-2 text-xs text-muted">
            Sent {formatDate(request.createdAt)}
            {request.respondedAt && ` · Responded ${formatDate(request.respondedAt)}`}
          </p>

          {(isAccepted || isInvested) && investor && (
            <div className="mt-3 rounded-lg border border-success/40 bg-success-bg p-3 text-sm">
              <p className="font-medium text-success">
                {isInvested ? "Invested — contact details" : "Accepted — contact the investor"}
              </p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs text-ink">
                {investor.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${investor.email}`} className="hover:underline">
                      {investor.email}
                    </a>
                  </span>
                )}
                {investor.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${investor.phone}`} className="hover:underline">
                      {investor.phone}
                    </a>
                  </span>
                )}
              </div>
            </div>
          )}

          {canWithdraw && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm("Withdraw this request?")) {
                    dispatch(withdrawInvestmentRequest(request._id));
                  }
                }}
              >
                Withdraw
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function BrowseInvestors() {
  const dispatch = useDispatch();
  const {
    investors,
    investorsStatus,
    myRequests,
    error,
  } = useSelector((state) => state.investor);

  const [query, setQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  useEffect(() => {
    dispatch(clearInvestorError());
    dispatch(fetchVerifiedInvestors());
    dispatch(fetchMyInvestmentRequests());
  }, [dispatch]);

  const activeInvestorIds = new Set(
    myRequests
      .filter((r) => ["Requested", "Accepted"].includes(r.status))
      .map((r) => r.investor?._id)
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return investors;
    return investors.filter((i) => {
      const hay = [i.name, i.company, i.investmentFocus, i.about]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [investors, query]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">Investors</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Browse verified investors and send a funding request with your terms.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {myRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">
            Your requests
          </h2>
          <div className="flex flex-col gap-3">
            {myRequests.map((r) => (
              <MyRequestCard key={r._id} request={r} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">
            Browse verified investors
            {investorsStatus === "succeeded" && investors.length > 0 && (
              <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs font-normal text-muted">
                {investors.length}
              </span>
            )}
          </h2>
        </div>

        {investors.length > 0 && (
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, or focus"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </div>
        )}

        {investorsStatus === "loading" && investors.length === 0 ? (
          <Loader label="Loading investors" />
        ) : investors.length === 0 ? (
          <Card>
            <div className="py-6 text-center">
              <p className="text-sm text-ink">No verified investors available yet.</p>
              <p className="mt-1 text-xs text-muted">
                Investors appear here after an admin verifies their profile.
              </p>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="py-4 text-center text-sm text-muted">
              No investors match "{query}".
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((inv) => {
              const alreadyRequested = activeInvestorIds.has(inv._id);
              return (
                <Card key={inv._id}>
                  <div className="flex items-start gap-4">
                    <Avatar user={inv} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {inv.name}
                      </h3>
                      {inv.company && <p className="text-sm text-ink">{inv.company}</p>}
                      {inv.investmentFocus && (
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gold-dark">
                          Focus: {inv.investmentFocus}
                        </p>
                      )}
                      {inv.ticketSize && (
                        <p className="mt-1 text-xs text-muted">
                          Ticket size: {inv.ticketSize}
                        </p>
                      )}
                      {inv.about && <p className="mt-2 text-sm text-ink">{inv.about}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyRequested ? "outline" : "primary"}
                      disabled={alreadyRequested}
                      onClick={() => setSelectedInvestor(inv)}
                    >
                      {alreadyRequested ? "Requested" : "Request"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {selectedInvestor && (
        <RequestModal
          investor={selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
        />
      )}
    </div>
  );
}