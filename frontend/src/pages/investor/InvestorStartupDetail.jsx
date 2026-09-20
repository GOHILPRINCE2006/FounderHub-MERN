import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStartupById } from "../../features/startup/startupSlice";
import {
  fetchStartupTeam,
  fetchMyRequests,
  sendConnectionRequest,
  clearInvestorError,
} from "../../features/investor/investorSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

function Person({ person, label }) {
  return (
    <div className="flex items-start gap-3">
      {person.avatar ? (
        <img src={person.avatar} alt={person.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
          {person.name?.[0] || "?"}
        </div>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink">{person.name}</p>
          <Badge tone={label === "Founder" ? "info" : "neutral"}>{label}</Badge>
        </div>
        {person.about && <p className="mt-0.5 text-xs text-muted">{person.about}</p>}
        {person.skills?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {person.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Own draft/submit state so typing never re-renders the rest of the page.
function ConnectForm({ startupId, previouslyDeclinedOn }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      // On success the request list reloads and this form is replaced by the status.
      await dispatch(sendConnectionRequest({ startupId, message: message.trim() })).unwrap();
    } catch (msg) {
      setFormError(typeof msg === "string" ? msg : "Failed to send request");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {previouslyDeclinedOn && (
        <p className="text-sm text-muted">
          The founder declined your earlier request on {previouslyDeclinedOn}. You can send a new one.
        </p>
      )}
      <Textarea
        name="connect-message"
        label="Message to the founder (optional)"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Introduce yourself and say what interests you about this startup."
        error={formError}
      />
      <div>
        <Button type="submit" loading={submitting}>
          Send connection request
        </Button>
      </div>
    </form>
  );
}

export default function InvestorStartupDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeStartup, detailStatus, error: startupError } = useSelector(
    (state) => state.startup
  );
  const { team, teamFor, teamStatus, myRequests, myRequestsStatus, error } = useSelector(
    (state) => state.investor
  );

  useEffect(() => {
    dispatch(clearInvestorError());
    dispatch(fetchStartupById(id));
    dispatch(fetchStartupTeam(id));
    dispatch(fetchMyRequests());
  }, [dispatch, id]);

  // activeStartup may still hold the previously opened startup.
  const startup = activeStartup?._id === id ? activeStartup : null;

  if (!startup) {
    return detailStatus === "failed" ? (
      <div className="mx-auto max-w-3xl">
        <ErrorMessage message={startupError || "Startup not found"} />
      </div>
    ) : (
      <Loader label="Loading startup" full />
    );
  }

  const teamLoaded = teamFor === id && team;
  // Server returns requests newest first.
  const latest = myRequests.find((r) => r.startup?._id === id);
  const requestsLoading =
    myRequestsStatus === "idle" || (myRequestsStatus === "loading" && myRequests.length === 0);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/investor/startups" className="mb-4 inline-block text-sm text-muted hover:text-ink">
        &larr; Back to startups
      </Link>

      <Card className="mb-6">
        <div className="flex items-start gap-4">
          {startup.logo ? (
            <img src={startup.logo} alt={startup.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-navy text-lg font-semibold text-white">
              {startup.name[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">{startup.name}</h1>
              <Badge status={startup.stage} />
            </div>
            <p className="text-sm text-muted">{startup.industry}</p>
          </div>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-ink">{startup.description}</p>
      </Card>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Team</h2>
      <Card className="mb-6">
        {teamStatus === "loading" && !teamLoaded ? (
          <Loader label="Loading team" />
        ) : teamLoaded ? (
          <div className="flex flex-col gap-4">
            {team.founder && <Person person={team.founder} label="Founder" />}
            {team.teamMembers?.map((member) => (
              <Person key={member._id} person={member} label="Team member" />
            ))}
            {!team.teamMembers?.length && (
              <p className="text-sm text-muted">No other team members yet.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Team details are unavailable right now.</p>
        )}
      </Card>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Connect</h2>
      <Card>
        {!user?.isVerified ? (
          <p className="text-sm text-gold-dark">
            Your investor account is awaiting verification. You can browse startups now, but
            connection requests unlock once you are verified.
          </p>
        ) : requestsLoading ? (
          <Loader label="Checking your requests" />
        ) : latest?.status === "Pending" ? (
          <div className="flex items-center gap-3">
            <Badge status="Pending" />
            <p className="text-sm text-muted">
              You sent a request on {formatDate(latest.createdAt)}. The founder hasn&apos;t
              responded yet.
            </p>
          </div>
        ) : latest?.status === "Accepted" ? (
          <div className="flex items-center gap-3">
            <Badge tone="success">Connected</Badge>
            <p className="text-sm text-muted">
              The founder accepted your request on {formatDate(latest.updatedAt)}.
            </p>
          </div>
        ) : (
          <ConnectForm
            startupId={id}
            previouslyDeclinedOn={latest?.status === "Rejected" ? formatDate(latest.updatedAt) : null}
          />
        )}
      </Card>
    </div>
  );
}
