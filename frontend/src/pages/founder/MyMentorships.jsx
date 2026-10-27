import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchMyMentorRequests,
  createPaymentOrder,
  verifyPayment,
  clearMentorError,
} from "../../features/mentor/mentorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Mail, Phone, IndianRupee, Calendar } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function Avatar({ user }) {
  return user?.avatar ? (
    <img src={user.avatar} alt={user.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-base font-semibold text-white">
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

async function launchRazorpay({ order, user, onSuccess, onError }) {
  if (!window.Razorpay) {
    onError("Razorpay checkout script not loaded. Refresh the page.");
    return;
  }
  const rzp = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "FounderHub",
    description: `Mentorship session with ${order.mentorName}`,
    order_id: order.orderId,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phone || "",
    },
    theme: { color: "#F59E0B" },
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

export default function MyMentorships() {
  const { startupId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myRequests, myRequestsStatus, error } = useSelector((state) => state.mentor);

  const [activeTab, setActiveTab] = useState("Active");
  const [payingId, setPayingId] = useState(null);
  const [payErr, setPayErr] = useState(null);

  useEffect(() => {
    dispatch(clearMentorError());
    dispatch(fetchMyMentorRequests());
  }, [dispatch]);

  const handlePay = async (request) => {
    setPayingId(request._id);
    setPayErr(null);
    try {
      const order = await dispatch(createPaymentOrder(request._id)).unwrap();
      await launchRazorpay({
        order,
        user,
        onSuccess: async (payload) => {
          try {
            await dispatch(verifyPayment(payload)).unwrap();
          } catch (m) {
            setPayErr(typeof m === "string" ? m : "Verification failed");
          } finally {
            setPayingId(null);
          }
        },
        onError: (msg) => {
          setPayErr(msg);
          setPayingId(null);
        },
      });
    } catch (m) {
      setPayErr(typeof m === "string" ? m : "Failed to start payment");
      setPayingId(null);
    }
  };

  if (myRequestsStatus === "loading" && myRequests.length === 0) {
    return <Loader label="Loading your mentorships" full />;
  }

  // FIRST: Filter out requests that belong to other startups
  const startupRequests = myRequests.filter((r) => r.startup?._id === startupId);

  // SECOND: Filter based on the active tab
  const filteredRequests = startupRequests.filter((r) => {
    if (activeTab === "Active") return ["Pending", "Accepted"].includes(r.status) && r.sessionStatus !== "Completed";
    if (activeTab === "Completed") return r.sessionStatus === "Completed";
    if (activeTab === "Archived") return ["Declined", "Cancelled"].includes(r.status);
    return false;
  });

  const activeCount = startupRequests.filter((r) => ["Pending", "Accepted"].includes(r.status) && r.sessionStatus !== "Completed").length;
  const completedCount = startupRequests.filter((r) => r.sessionStatus === "Completed").length;
  const archivedCount = startupRequests.filter((r) => ["Declined", "Cancelled"].includes(r.status)).length;

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">My Mentorships</h1>
        <p className="mt-1 text-sm text-muted">
          Track your requests, communicate with mentors, and manage your sessions.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => dispatch(fetchMyMentorRequests())} />
        </div>
      )}

      {payErr && (
        <div className="mb-6">
          <ErrorMessage message={payErr} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {[
          { id: "Active", label: "Active & Pending", count: activeCount },
          { id: "Completed", label: "Completed", count: completedCount },
          { id: "Archived", label: "Archived", count: archivedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-gold text-gold-dark"
                : "border-transparent text-muted hover:border-border-strong hover:text-ink"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              activeTab === tab.id ? "bg-gold-soft text-gold-dark" : "bg-paper text-muted"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <p className="py-12 text-center text-sm text-muted">
            No mentorships found in this section.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === "Pending";
            const isAccepted = req.status === "Accepted";
            const isPaid = req.paymentStatus === "Paid";

            return (
              <Card key={req._id} className="overflow-hidden">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  
                  {/* Left: Mentor Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <Avatar user={req.mentor} />
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">
                          {req.mentor?.name || "Unknown Mentor"}
                        </h3>
                        <p className="text-sm text-muted">
                          {req.mentor?.currentRole} {req.mentor?.company && `at ${req.mentor.company}`}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Requested on {formatDate(req.createdAt)} for <span className="font-medium text-ink">{req.startup?.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-paper p-4 space-y-2">
                      <p className="text-sm text-ink"><span className="font-semibold">Challenge:</span> {req.challenge}</p>
                      <p className="text-sm text-ink"><span className="font-semibold">Goals:</span> {req.goals}</p>
                    </div>

                    {isPaid && (
                      <div className="rounded-xl border border-success/30 bg-success-bg p-4 text-sm">
                        <p className="font-medium text-success mb-2">Paid — Contact the Mentor</p>
                        <div className="flex flex-col gap-1.5 text-sm text-ink">
                          {req.mentor?.email && (
                            <span className="inline-flex items-center gap-2">
                              <Mail className="h-4 w-4 text-success" />
                              <a href={`mailto:${req.mentor.email}`} className="hover:underline">{req.mentor.email}</a>
                            </span>
                          )}
                          {req.mentor?.phone && (
                            <span className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4 text-success" />
                              <a href={`tel:${req.mentor.phone}`} className="hover:underline">{req.mentor.phone}</a>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col gap-4 sm:w-64 sm:border-l sm:border-border sm:pl-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">Status</p>
                      <Badge tone={
                        isPaid ? "success" : 
                        isAccepted ? "info" : 
                        isPending ? "warning" : "neutral"
                      }>
                        {isPaid ? "Paid" : req.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-muted">Session Rate</p>
                      <p className="font-display text-xl font-bold text-ink">{formatINR(req.priceAtRequest)}</p>
                    </div>

                    {isAccepted && !isPaid && (
                      <div className="mt-auto">
                        <Button
                          className="w-full"
                          loading={payingId === req._id}
                          onClick={() => handlePay(req)}
                        >
                          <IndianRupee className="h-4 w-4" />
                          Pay Now
                        </Button>
                      </div>
                    )}

                    {isPaid && (
                      <div className="mt-auto">
                        <Button variant="outline" className="w-full">
                          <Calendar className="h-4 w-4" />
                          Schedule Session
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