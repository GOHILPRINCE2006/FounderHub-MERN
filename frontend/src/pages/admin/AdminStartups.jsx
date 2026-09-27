import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminStartups,
  hideStartup,
  unhideStartup,
  deleteStartupAdmin,
  clearAdminError,
} from "../../features/admin/adminSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonList } from "../../components/common/Skeleton";

export default function AdminStartups() {
  const dispatch = useDispatch();
  const { startups, startupsStatus, error } = useSelector((state) => state.admin);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(clearAdminError());
    dispatch(fetchAdminStartups());
  }, [dispatch]);

  const handleHide = async (s) => {
    if (!window.confirm(`Hide "${s.name}" from the public listing?`)) return;
    setBusyId(s._id);
    await dispatch(hideStartup(s._id));
    setBusyId(null);
  };

  const handleUnhide = async (s) => {
    setBusyId(s._id);
    await dispatch(unhideStartup(s._id));
    setBusyId(null);
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    setBusyId(s._id);
    await dispatch(deleteStartupAdmin(s._id));
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-xl font-semibold text-ink">Startups</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        All startups on the platform, including hidden ones.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {startupsStatus === "loading" && startups.length === 0 ? (
        <SkeletonList count={4} />
      ) : startups.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">No startups yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {startups.map((s) => (
            <Card key={s._id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt={s.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-base font-semibold text-white">
                    {s.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-ink">{s.name}</p>
                    <Badge status={s.stage} />
                    {!s.isModerated && <Badge tone="danger">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-muted">
                    {s.industry}
                    {s.founder?.name && ` · by ${s.founder.name}`}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {s.description}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {s.isModerated ? (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busyId === s._id}
                      onClick={() => handleHide(s)}
                    >
                      Hide
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busyId === s._id}
                      onClick={() => handleUnhide(s)}
                    >
                      Unhide
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    loading={busyId === s._id}
                    onClick={() => handleDelete(s)}
                  >
                    Delete
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