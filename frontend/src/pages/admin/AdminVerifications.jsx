import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifications,
  approveVerification,
  revokeVerification,
  clearAdminError,
} from "../../features/admin/adminSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { AlertCircle, Code2, Briefcase, Globe } from "lucide-react";

function getMissingForMentor(u) {
  const missing = [];
  if (!u.currentRole) missing.push("Current role");
  if (!u.company) missing.push("Company");
  if (!u.expertise) missing.push("Expertise");
  if (!u.yearsOfExperience) missing.push("Years of experience");
  if (!u.sessionPrice || u.sessionPrice <= 0) missing.push("Session price");
  return missing;
}

export default function AdminVerifications() {
  const dispatch = useDispatch();
  const { verifications, verificationsStatus, error } = useSelector(
    (state) => state.admin
  );
  const [tab, setTab] = useState("mentor");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(clearAdminError());
    dispatch(fetchVerifications("mentor"));
    dispatch(fetchVerifications("investor"));
  }, [dispatch]);

  const list = verifications[tab] || [];

  const handleApprove = async (u) => {
    setBusyId(u._id);
    await dispatch(approveVerification(u._id));
    setBusyId(null);
  };

  const handleRevoke = async (u) => {
    if (!window.confirm(`Decline or revoke verification for ${u.name}?`)) return;
    setBusyId(u._id);
    await dispatch(revokeVerification(u._id));
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-xl font-semibold text-ink">Verifications</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Review full profiles before approving. Mentors must have a complete profile.
      </p>

      <div className="mb-4 flex gap-1 border-b border-border">
        {[
          { key: "mentor", label: "Mentors", count: (verifications.mentor || []).length },
          { key: "investor", label: "Investors", count: (verifications.investor || []).length },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? "border-gold font-medium text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 rounded-full bg-warning-bg px-2 py-0.5 text-xs text-gold-dark">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {verificationsStatus === "loading" && list.length === 0 ? (
        <Loader label="Loading verifications" />
      ) : list.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No {tab}s awaiting verification.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((u) => {
            const missing =
              tab === "mentor" ? getMissingForMentor(u) : [];
            const isIncomplete = missing.length > 0;

            return (
              <Card key={u._id}>
                <div className="flex items-start gap-4">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-base font-semibold text-white">
                      {u.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {u.name}
                      </h3>
                      <Badge tone="warning">Pending</Badge>
                      {isIncomplete && <Badge tone="danger">Incomplete</Badge>}
                    </div>
                    <p className="text-xs text-muted">{u.email}</p>

                    {(u.currentRole || u.company) && (
                      <p className="mt-1 text-sm text-ink">
                        {u.currentRole}
                        {u.currentRole && u.company && " at "}
                        {u.company && <span className="font-medium">{u.company}</span>}
                      </p>
                    )}

                    {u.yearsOfExperience > 0 && (
                      <p className="mt-0.5 text-xs text-muted">
                        {u.yearsOfExperience} years of experience
                      </p>
                    )}

                    {u.sessionPrice > 0 && (
                      <p className="mt-0.5 text-xs text-muted">
                        Session price: ₹{u.sessionPrice}
                      </p>
                    )}

                    {u.expertise && (
                      <p className="mt-2 text-xs uppercase tracking-wider text-muted">
                        Expertise: {u.expertise}
                      </p>
                    )}

                    {u.investmentFocus && (
                      <p className="mt-2 text-xs uppercase tracking-wider text-muted">
                        Investment focus: {u.investmentFocus}
                      </p>
                    )}

                    {u.about && (
                      <p className="mt-2 text-sm text-ink">{u.about}</p>
                    )}

                    {u.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {u.skills.map((s) => (
                          <span key={s} className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {(u.github || u.linkedin || u.website) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {u.github && (
                          <a
                            href={u.github.startsWith("http") ? u.github : `https://${u.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-ink hover:border-border-strong"
                          >
                            <Code2 className="h-3.5 w-3.5 text-muted" /> GitHub
                          </a>
                        )}
                        {u.linkedin && (
                          <a
                            href={u.linkedin.startsWith("http") ? u.linkedin : `https://${u.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-ink hover:border-border-strong"
                          >
                            <Briefcase className="h-3.5 w-3.5 text-muted" /> LinkedIn
                          </a>
                        )}
                        {u.website && (
                          <a
                            href={u.website.startsWith("http") ? u.website : `https://${u.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-ink hover:border-border-strong"
                          >
                            <Globe className="h-3.5 w-3.5 text-muted" /> Website
                          </a>
                        )}
                      </div>
                    )}

                    {isIncomplete && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2 text-xs text-danger">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          Missing: {missing.join(", ")}. Ask the mentor to fill their profile
                          before approving.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      size="sm"
                      loading={busyId === u._id}
                      disabled={isIncomplete}
                      onClick={() => handleApprove(u)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busyId === u._id}
                      onClick={() => handleRevoke(u)}
                    >
                      Decline
                    </Button>
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