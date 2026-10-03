import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceivedInvestmentRequests,
  respondToInvestmentRequest,
  createInvestmentOrder,
  verifyInvestmentPayment,
  clearInvestorError,
} from "../../features/investor/investorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { IndianRupee, Mail, Phone, X } from "lucide-react";

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

async function launchRazorpay({ order, user, onSuccess, onError }) {
  if (!window.Razorpay) {
    onError("Razorpay script not loaded. Refresh the page.");
    return;
  }
  const rzp = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "FounderHub",
    description: `Investment in startup`,
    order_id: order.orderId,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phone || "",
    },
    theme: { color: "#e3a008" },
    handler: (response) => {
      onSuccess({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    modal: { ondismiss: () => onError("Payment cancelled") },
  });
  rzp.open();
}

function PayModal({ request, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [amount, setAmount] = useState(String(request.proposedAmount || ""));
  const [equity, setEquity] = useState(String(request.proposedEquity || ""));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const pay = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const order = await dispatch(
        createInvestmentOrder({
          investorConnectionId: request._id,
          amount: Number(amount),
          equityPercent: Number(equity),
        })
      ).unwrap();

      await launchRazorpay({
        order,
        user,
        onSuccess: async (payload) => {
          try {
            await dispatch(verifyInvestmentPayment(payload)).unwrap();
            onClose();
          } catch (m) {
            setErr(typeof m === "string" ? m : "Verification failed");
            setBusy(false);
          }
        },
        onError: (msg) => {
          setErr(msg);
          setBusy(false);
        },
      });
    } catch (m) {
      setErr(typeof m === "string" ? m : "Failed to start payment");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-base font-semibold text-ink">
            Invest in this startup
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-paper">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-muted">
          Founder proposed {formatINR(request.proposedAmount)} for {request.proposedEquity}%.
          You can adjust the amount/equity below based on your discussion.
        </p>

        <form onSubmit={pay} className="mt-4 flex flex-col gap-4">
          <Input
            label="Amount (INR) *"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Equity (%) *"
            type="number"
            step="0.01"
            min={0.01}
            max={100}
            value={equity}
            onChange={(e) => setEquity(e.target.value)}
            required
          />
          {err && <p className="text-xs text-danger">{err}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              <IndianRupee className="h-3.5 w-3.5" />
              Invest {formatINR(amount)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RequestCard({ request, busy, onAccept, onDecline, onPay }) {
  const { startup, founder, status } = request;
  const isPending = status === "Requested";
  const isAccepted = status === "Accepted";
  const isInvested = status === "Invested";

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-base font-semibold text-ink">
          {startup?.name || "Unknown startup"}
        </h3>
        <Badge
          tone={
            isInvested
              ? "success"
              : isAccepted
              ? "info"
              : status === "Declined"
              ? "danger"
              : "warning"
          }
        >
          {status}
        </Badge>
        {startup?.stage && <Badge status={startup.stage} />}
      </div>
      <p className="text-xs text-muted">
        {[startup?.industry, startup?.location].filter(Boolean).join(" · ")}
      </p>
      {startup?.tagline && <p className="mt-1 text-sm text-ink">{startup.tagline}</p>}

      {startup?.problem && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Problem</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{startup.problem}</p>
        </div>
      )}
      {startup?.solution && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Solution</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{startup.solution}</p>
        </div>
      )}
      {startup?.traction && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Traction</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{startup.traction}</p>
        </div>
      )}
      {startup?.technologies?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {startup.technologies.map((t) => (
            <span key={t} className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1 font-medium text-ink">
          <IndianRupee className="h-3.5 w-3.5" />
          {formatINR(request.proposedAmount)}
        </span>
        <span className="text-muted">
          for <span className="font-medium text-ink">{request.proposedEquity}%</span> equity
        </span>
      </div>

      {request.message && (
        <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
          "{request.message}"
        </p>
      )}

      <p className="mt-2 text-xs text-muted">
        Requested by{" "}
        <span className="font-medium text-ink">{founder?.name || "a founder"}</span> on{" "}
        {formatDate(request.createdAt)}
      </p>

      {(isAccepted || isInvested) && founder && (
        <div className="mt-3 rounded-lg border border-success/40 bg-success-bg p-3 text-sm">
          <p className="font-medium text-success">Contact the founder</p>
          <div className="mt-1.5 flex flex-col gap-1 text-xs text-ink">
            {founder.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${founder.email}`} className="hover:underline">
                  {founder.email}
                </a>
              </span>
            )}
            {founder.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <a href={`tel:${founder.phone}`} className="hover:underline">
                  {founder.phone}
                </a>
              </span>
            )}
          </div>
        </div>
      )}

      {isPending && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            loading={busy === "accept"}
            disabled={busy === "decline"}
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={busy === "decline"}
            disabled={busy === "accept"}
            onClick={onDecline}
          >
            Decline
          </Button>
        </div>
      )}

      {isAccepted && (
        <div className="mt-3">
          <Button size="sm" onClick={onPay}>
            <IndianRupee className="h-3.5 w-3.5" />
            Invest
          </Button>
        </div>
      )}

      {isInvested && (
        <p className="mt-3 text-sm text-success">
          You invested <span className="font-medium">{formatINR(request.finalAmount)}</span> for{" "}
          <span className="font-medium">{request.finalEquity}%</span> equity.
        </p>
      )}
    </Card>
  );
}

export default function Requests() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { received, receivedStatus, error } = useSelector((state) => state.investor);
  const [busy, setBusy] = useState({ id: null, action: null });
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    dispatch(clearInvestorError());
    dispatch(fetchReceivedInvestmentRequests());
  }, [dispatch]);

  const handleRespond = async (id, decision) => {
    setBusy({ id, action: decision });
    await dispatch(respondToInvestmentRequest({ id, decision }));
    setBusy({ id: null, action: null });
  };

  if (receivedStatus === "idle" || (receivedStatus === "loading" && received.length === 0)) {
    return <Loader label="Loading requests" full />;
  }

  const pending = received.filter((r) => r.status === "Requested");
  const accepted = received.filter((r) => r.status === "Accepted");
  const invested = received.filter((r) => r.status === "Invested");
  const declined = received.filter((r) => r.status === "Declined");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">Funding Requests</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Founders asking you to invest. Review the startup, accept or decline, then pay if interested.
      </p>

      {!user?.isVerified && (
        <div className="mb-4 rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-gold-dark">
          Your investor account is awaiting verification. Requests will appear here once approved.
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => dispatch(fetchReceivedInvestmentRequests())} />
        </div>
      )}

      {received.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">No requests yet.</p>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Awaiting your decision ({pending.length})
              </h2>
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <RequestCard
                    key={r._id}
                    request={r}
                    busy={busy.id === r._id ? busy.action : null}
                    onAccept={() => handleRespond(r._id, "accept")}
                    onDecline={() => handleRespond(r._id, "decline")}
                  />
                ))}
              </div>
            </section>
          )}

          {accepted.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Accepted — ready to invest ({accepted.length})
              </h2>
              <div className="flex flex-col gap-3">
                {accepted.map((r) => (
                  <RequestCard key={r._id} request={r} onPay={() => setPaying(r)} />
                ))}
              </div>
            </section>
          )}

          {invested.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Your investments ({invested.length})
              </h2>
              <div className="flex flex-col gap-3">
                {invested.map((r) => (
                  <RequestCard key={r._id} request={r} />
                ))}
              </div>
            </section>
          )}

          {declined.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-semibold text-ink">
                Declined ({declined.length})
              </h2>
              <div className="flex flex-col gap-3">
                {declined.map((r) => (
                  <RequestCard key={r._id} request={r} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {paying && <PayModal request={paying} onClose={() => setPaying(null)} />}
    </div>
  );
}