import { useParams } from "react-router-dom";
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
import { Search, Mail, Phone, X, CheckCircle2, Briefcase } from "lucide-react";

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

function Avatar({ user, size = "md" }) {
  const dim = size === "lg" ? "h-20 w-20" : "h-14 w-14";
  return user?.avatar ? (
    <img src={user.avatar} alt={user.name} className={`${dim} shrink-0 rounded-full object-cover shadow-sm ring-4 ring-white`} />
  ) : (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-full bg-navy text-2xl font-semibold text-white shadow-sm ring-4 ring-white`}>
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function RequestModal({ investor, onClose }) {
  const { startupId } = useParams();
  const dispatch = useDispatch();

  const [amount, setAmount] = useState("");
  const [equity, setEquity] = useState("");
  const [pitch, setPitch] = useState("");
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
          pitch,
          proposedAmount: Number(amount),
          proposedEquity: Number(equity),
          startupId,
        })
      ).unwrap();
      onClose();
    } catch (m) {
      setErr(typeof m === "string" ? m : "Failed to send request");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
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
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
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
  const [withdrawing, setWithdrawing] = useState(false);

  const investor = request.investor;
  const isAccepted = request.status === "Accepted";
  const isInvested = request.status === "Invested";

  const canWithdraw =
    request.status === "Pending" ||
    (request.status === "Accepted" && request.paymentStatus === "Unpaid");

  const handleWithdraw = async () => {
    if (!window.confirm("Withdraw this funding request?")) return;
    setWithdrawing(true);
    try {
      await dispatch(withdrawInvestmentRequest(request._id)).unwrap();
    } catch {
      // Error handled in banner
    } finally {
      setWithdrawing(false);
    }
  };

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

          {request.pitch && (
            <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
              "{request.pitch}"
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
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                loading={withdrawing}
                disabled={withdrawing}
                onClick={handleWithdraw}
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
  const { startupId } = useParams(); // <-- GET ID FROM URL
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

  // 1. FILTER: Only get requests for THIS startup
  const startupRequests = useMemo(() => {
    return myRequests.filter((r) => r.startup?._id === startupId || r.startup === startupId);
  }, [myRequests, startupId]);

  // 2. LOCK: Only lock the button if the request is Pending or Accepted for THIS startup
  const activeInvestorIds = useMemo(() => {
    return new Set(
      startupRequests
        .filter((r) => ["Pending", "Accepted"].includes(r.status))
        .map((r) => r.investor?._id)
    );
  }, [startupRequests]);

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

  // 3. LIMIT: Only show top 3 recent requests for THIS startup
  const recentRequests = useMemo(() => {
    return startupRequests.slice(0, 3);
  }, [startupRequests]);

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <h1 className="font-display text-2xl font-bold text-ink">Investors</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Browse verified investors and send a funding request with your terms.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {recentRequests.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            Recent Requests
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentRequests.map((r) => (
              <MyRequestCard key={r._id} request={r} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            Browse Verified Investors
          </h2>
        </div>

        {investors.length > 0 && (
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company, or focus"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-12 pr-4 text-base text-ink placeholder:text-muted shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </div>
        )}

        {investorsStatus === "loading" && investors.length === 0 ? (
          <Loader label="Loading investors" />
        ) : investors.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="text-sm text-ink">No verified investors available yet.</p>
              <p className="mt-1 text-xs text-muted">
                Investors appear here after an admin verifies their profile.
              </p>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="py-12 text-center text-sm text-muted">
              No investors match "{query}".
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((inv) => {
              const alreadyRequested = activeInvestorIds.has(inv._id);
              return (
                <Card key={inv._id} className="overflow-hidden border-border/80 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex flex-col sm:flex-row">
                    
                    {/* LEFT SIDE: Warm background, Avatar & Name */}
                    <div className="flex flex-col items-center border-b border-border bg-[#FAF7F2] p-6 sm:w-64 sm:border-b-0 sm:border-r">
                      <Avatar user={inv} size="lg" />
                      <h3 className="mt-4 font-display text-lg font-bold text-ink text-center">{inv.name}</h3>
                      {inv.company && <p className="mt-1 text-center text-sm font-medium text-ink">{inv.company}</p>}
                      
                      {inv.ticketSize && (
                        <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-muted shadow-sm">
                          <Briefcase className="h-3 w-3" /> {inv.ticketSize}
                        </p>
                      )}
                      
                      {inv.isVerified && (
                        <div className="mt-3 flex items-center gap-1 rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </div>
                      )}
                    </div>

                    {/* RIGHT SIDE: Details */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <p className="text-sm leading-relaxed text-muted">
                          {inv.about || "No bio provided."}
                        </p>
                        
                        {inv.investmentFocus && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {inv.investmentFocus.split(",").slice(0, 5).map((focus) => (
                              <span key={focus} className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-medium text-ink">
                                {focus.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                        <div>
                          <p className="text-xs text-muted">Focus</p>
                          <p className="font-display text-lg font-bold text-ink">
                            {inv.investmentFocus ? "Active Investor" : "Generalist"}
                          </p>
                        </div>
                        <Button
                          disabled={alreadyRequested}
                          onClick={() => setSelectedInvestor(inv)}
                          className="rounded-xl px-6"
                        >
                          {alreadyRequested ? "Requested" : "Request"}
                        </Button>
                      </div>
                    </div>
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