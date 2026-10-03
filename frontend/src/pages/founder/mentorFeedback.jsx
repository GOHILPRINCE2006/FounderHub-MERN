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
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Search, Briefcase, IndianRupee, Mail, Phone } from "lucide-react";

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
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr(null);
    try {
      await dispatch(requestMentor({ mentorId: mentor._id, message })).unwrap();
      onClose();
    } catch (m) {
      setErr(typeof m === "string" ? m : "Failed to send request");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <h3 className="font-display text-base font-semibold text-ink">
          Request a session with {mentor.name}
        </h3>
        <p className="mt-1 text-xs text-muted">
          Session price: <span className="font-medium text-ink">{formatINR(mentor.sessionPrice)}</span>
          {" — "}you&apos;ll pay only after the mentor accepts.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <Textarea
            label="Message (optional)"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Briefly describe what you'd like help with."
            error={err}
          />
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

// Loads Razorpay Checkout for a specific accepted request.
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
  const isPaid = request.status === "Paid";

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
              {request.status}
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

          {request.status === "Accepted" && (
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

  // Mentors with an active request (Requested / Accepted) are hidden from browse.
  const activeMentorIds = new Set(
    myRequests
      .filter((r) => r.status === "Requested" || r.status === "Accepted")
      .map((r) => r.mentor?._id)
  );

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
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">Mentors</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Browse verified mentors and book a session. Payment happens after the mentor accepts.
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-ink">
            Browse verified mentors
            {mentorsStatus === "succeeded" && mentors.length > 0 && (
              <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs font-normal text-muted">
                {mentors.length}
              </span>
            )}
          </h2>
        </div>

        {mentors.length > 0 && (
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, expertise, or company"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </div>
        )}

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
              No mentors match &quot;{query}&quot;.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMentors.map((mentor) => {
              const alreadyRequested = activeMentorIds.has(mentor._id);
              return (
                <Card key={mentor._id}>
                  <div className="flex items-start gap-4">
                    <Avatar user={mentor} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {mentor.name}
                      </h3>

                      {(mentor.currentRole || mentor.company) && (
                        <p className="mt-0.5 text-sm text-ink">
                          {mentor.currentRole}
                          {mentor.currentRole && mentor.company && " at "}
                          {mentor.company && (
                            <span className="font-medium">{mentor.company}</span>
                          )}
                        </p>
                      )}

                      {mentor.yearsOfExperience > 0 && (
                        <p className="mt-0.5 text-xs text-muted">
                          {mentor.yearsOfExperience} years of experience
                        </p>
                      )}

                      {mentor.expertise && (
                        <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gold-dark">
                          Expertise: {mentor.expertise}
                        </p>
                      )}

                      {mentor.about && (
                        <p className="mt-2 text-sm text-ink">{mentor.about}</p>
                      )}

                      {mentor.skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {mentor.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {mentor.sessionPrice > 0 && (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {formatINR(mentor.sessionPrice)} / session
                          </span>
                        )}
                        {mentor.linkedin && (
                          <a
                            href={
                              mentor.linkedin.startsWith("http")
                                ? mentor.linkedin
                                : `https://${mentor.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:underline"
                          >
                            <Briefcase className="h-3.5 w-3.5" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyRequested ? "outline" : "primary"}
                      disabled={alreadyRequested}
                      onClick={() => setSelectedMentor(mentor)}
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

      {selectedMentor && (
        <RequestModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  );
}