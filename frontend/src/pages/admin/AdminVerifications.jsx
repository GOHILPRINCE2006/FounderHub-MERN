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
    if (!window.confirm(`Revoke verification for ${u.name}?`)) return;
    setBusyId(u._id);
    await dispatch(revokeVerification(u._id));
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-xl font-semibold text-ink">Verifications</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Approve mentor and investor accounts so they can access their features.
      </p>

      {/* Tabs */}
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
        <div className="flex flex-col gap-2">
          {list.map((u) => (
            <Card key={u._id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                {u.avatar ? (
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-ink">{u.name}</p>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                  {u.currentRole && u.company && (
                    <p className="text-xs text-muted">
                      {u.currentRole} at {u.company}
                    </p>
                  )}
                  {u.expertise && (
                    <p className="mt-1 text-sm text-ink">{u.expertise}</p>
                  )}
                  {u.investmentFocus && (
                    <p className="mt-1 text-sm text-ink">
                      Focus: {u.investmentFocus}
                    </p>
                  )}
                  {u.about && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{u.about}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    loading={busyId === u._id}
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
          ))}
        </div>
      )}
    </div>
  );
}