import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentors,
  fetchMyMentorRequests,
  requestMentor,
  createPaymentOrder,
  verifyPayment,
  clearMentorError,
} from "../../features/mentor/mentorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Textarea from "../../components/common/Textarea";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Search, Briefcase, IndianRupee, Mail, Phone, CheckCircle2, X } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

function Avatar({ user, size = "md" }) {
  const dim = size === "lg" ? "h-16 w-16" : "h-14 w-14";
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className={`${dim} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full bg-navy text-base font-semibold text-white`}
    >
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function RequestModal({ mentor, onClose }) {
  const { startupId } = useParams();
  const dispatch = useDispatch();
  const [challenge, setChallenge] = useState("");
  const [goals, setGoals] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr(null);
    try {
      await dispatch(
        requestMentor({
          mentorId: mentor._id,
          startupId,
          challenge,
          goals,
          message,
          preferredFormat: "1-on-1",
        })
      ).unwrap();
      onClose();
    } catch (m) {
      setErr(typeof m === "string" ? m : "Failed to send request");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-paper px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-ink">
            Request Mentorship
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-border hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={submit} className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-4 rounded-xl bg-sand/30 p-4">
            <Avatar user={mentor} />
            <div>
              <p className="font-display font-semibold text-ink">{mentor.name}</p>
              <p className="text-sm text-muted">{mentor.currentRole} @ {mentor.company}</p>
              <p className="mt-1 text-sm font-medium text-gold-dark">₹{mentor.sessionPrice} / session</p>
            </div>
          </div>

          <Input
            label="What is the main challenge? *"
            placeholder="e.g. We are struggling to get our first 100 users."
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            required
          />

          <Input
            label="What are your goals for this session? *"
            placeholder="e.g. I need a go-to-market strategy."
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
          />

          <Textarea
            label="Message to mentor (optional)"
            rows={3}
            placeholder="Anything else they should know before the session?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={err}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={sending}>
              Send Request
            </Button>
          </div>
        </form>
      </div>
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
    theme: { color: "#e3a008" },
    handler: (response) => {
      onSuccess({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => onError("Payment cancelled"),
    },
  });
  rzp.open();
}

function MyRequestCard({ request }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState(null);

  const mentor = request.mentor;
  // THE FIX: Check paymentStatus instead of status
  const isPaid = request.paymentStatus === "Paid";

  const handlePay = async () => {
    setPaying(true);
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
            setPaying(false);
          }
        },
        onError: (msg) => {
          setPayErr(msg);
          setPaying(false);
        },
      });
    } catch (m) {
      setPayErr(typeof m === "string" ? m : "Failed to start payment");
      setPaying(false);
    }
  };

  return (
    <Card>
      <div className="flex items-start gap-4">
        <Avatar user={mentor} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">
              {mentor?.name || "Unknown mentor"}
            </h3>
            <Badge
              tone={
                isPaid
                  ? "success"
                  : request.status === "Accepted"
                  ? "info"
                  : request.status === "Declined"
                  ? "danger"
                  : "warning"
              }
            >
              {isPaid ? "Paid" : request.status}
            </Badge>
          </div>
          {(mentor?.currentRole || mentor?.company) && (
            <p className="text-xs text-muted">
              {mentor.currentRole}
              {mentor.currentRole && mentor.company && " at "}
              {mentor.company}
            </p>
          )}
          <p className="mt-1 text-xs text-muted">
            Sent {formatDate(request.createdAt)}
            {request.respondedAt && ` · Responded ${formatDate(request.respondedAt)}`}
          </p>

          {request.priceAtRequest > 0 && (
            <p className="mt-2 text-sm text-ink">
              Session price: <span className="font-medium">{formatINR(request.priceAtRequest)}</span>
            </p>
          )}

          {request.challenge && (
            <p className="mt-2 text-sm text-ink">
              <span className="font-medium">Challenge:</span> {request.challenge}
            </p>
          )}

          {request.message && (
            <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
              "{request.message}"
            </p>
          )}

          {isPaid && mentor && (
            <div className="mt-3 rounded-lg border border-success/40 bg-success-bg p-3 text-sm">
              <p className="font-medium text-success">Paid — you can now contact the mentor</p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs text-ink">
                {mentor.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${mentor.email}`} className="hover:underline">
                      {mentor.email}
                    </a>
                  </span>
                )}
                {mentor.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${mentor.phone}`} className="hover:underline">
                      {mentor.phone}
                    </a>
                  </span>
                )}
              </div>
            </div>
          )}

          {request.status === "Accepted" && !isPaid && (
            <div className="mt-3">
              <Button size="sm" loading={paying} onClick={handlePay}>
                <IndianRupee className="h-3.5 w-3.5" />
                Pay {formatINR(request.priceAtRequest)}
              </Button>
              {payErr && <p className="mt-2 text-xs text-danger">{payErr}</p>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MentorFeedback() {
  const { startupId } = useParams();
  const dispatch = useDispatch();
  const {
    mentors,
    mentorsStatus,
    myRequests,
    myRequestsStatus,
    error,
  } = useSelector((state) => state.mentor);

  const [query, setQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    dispatch(clearMentorError());
    dispatch(fetchMentors());
    dispatch(fetchMyMentorRequests());
  }, [dispatch]);

  // Mentors with an active request (Pending / Accepted) are hidden from browse.
    // Block new requests ONLY if there is an active, unpaid, or ongoing session
    // Block new requests ONLY if there is an active session FOR THIS SPECIFIC STARTUP
  const activeMentorIds = new Set(
    myRequests
      .filter((r) => {
        // Must belong to the current startup
        if (r.startup?._id !== startupId) return false;

        if (r.status === "Pending") return true;
        if (r.status === "Accepted" && r.paymentStatus === "Unpaid") return true;
        if (r.status === "Accepted" && r.paymentStatus === "Paid" && r.sessionStatus !== "Completed") return true;
        return false;
      })
      .map((r) => r.mentor?._id)
  );

  // Also, filter the "Your Requests" list so it only shows requests for THIS startup
  const startupRequests = myRequests.filter((r) => r.startup?._id === startupId);

  const filteredMentors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter((m) => {
      const hay = [
        m.name, m.expertise, m.currentRole, m.company, m.about, m.experience,
        ...(m.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [mentors, query]);

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Find Your Startup Mentor
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
          Get guidance from experienced professionals who can help you build and grow your startup.
        </p>
      </div>

      <div className="mx-auto mb-10 max-w-3xl">
        <div className="relative flex items-center rounded-xl border border-border bg-surface shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-gold">
          <Search className="ml-4 h-5 w-5 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, expertise, skills, or company..."
            className="w-full bg-transparent px-4 py-4 text-base text-ink placeholder:text-muted focus:outline-none"
          />
          <Button className="mr-2 rounded-lg px-6">Search</Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 mx-auto max-w-3xl">
          <ErrorMessage message={error} />
        </div>
      )}

      {startupRequests.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">Your Requests</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {startupRequests.map((r) => (
              <MyRequestCard key={r._id} request={r} />
            ))}
          </div>
        </section>
      )}

          <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Available Mentors</h2>

      {mentorsStatus === "loading" && mentors.length === 0 ? (
        <Loader label="Loading mentors" />
      ) : mentors.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <p className="text-sm text-ink">No verified mentors available yet.</p>
            <p className="mt-1 text-xs text-muted">
              Mentors appear here after an admin verifies their profile.
            </p>
          </div>
        </Card>
      ) : filteredMentors.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No mentors match "{query}".
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredMentors.map((mentor) => {
            const alreadyRequested = activeMentorIds.has(mentor._id);
            
            return (
              <Card key={mentor._id} className="overflow-hidden border-border/80 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex flex-col sm:flex-row">
                  
                  {/* LEFT SIDE: Avatar & Name (Warm background) */}
                  <div className="flex flex-col items-center border-b border-border bg-[#FAF7F2] p-6 sm:w-64 sm:border-b-0 sm:border-r">
                    <Avatar user={mentor} size="lg" />
                    <h3 className="mt-4 font-display text-lg font-bold text-ink text-center">{mentor.name}</h3>
                    <p className="mt-1 text-center text-sm font-medium text-ink">{mentor.currentRole}</p>
                    <p className="text-center text-sm text-muted">{mentor.company}</p>
                    
                    {mentor.yearsOfExperience > 0 && (
                      <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-muted shadow-sm">
                        <Briefcase className="h-3 w-3" /> {mentor.yearsOfExperience} years exp
                      </p>
                    )}
                    {mentor.isVerified && (
                      <div className="mt-3 flex items-center gap-1 rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </div>
                    )}
                  </div>

                  {/* RIGHT SIDE: Details */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <p className="text-sm leading-relaxed text-muted">
                        {mentor.about || mentor.experience || "No bio provided."}
                      </p>
                      
                      {mentor.expertise && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {mentor.expertise.split(",").slice(0, 5).map((exp) => (
                            <span key={exp} className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-medium text-ink">
                              {exp.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-muted">Starting from</p>
                        <p className="font-display text-2xl font-bold text-ink">
                          {formatINR(mentor.sessionPrice)}
                          <span className="text-sm font-normal text-muted"> / session</span>
                        </p>
                      </div>
                      <Button
                        disabled={alreadyRequested || !mentor.isAcceptingRequests}
                        onClick={() => setSelectedMentor(mentor)}
                        className="rounded-xl px-6"
                      >
                        {alreadyRequested ? "Requested" : mentor.isAcceptingRequests ? "Request Session" : "Not Available"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

            {selectedMentor && (
        <RequestModal 
          mentor={selectedMentor} 
          startupId={startupId} // <--- THIS IS CRITICAL
          onClose={() => setSelectedMentor(null)} 
        />
      )}
    </div>
  );
}