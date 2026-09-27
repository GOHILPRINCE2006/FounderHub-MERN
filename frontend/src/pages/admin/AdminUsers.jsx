import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  blockUser,
  unblockUser,
  deleteUser,
  clearAdminError,
} from "../../features/admin/adminSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Search } from "lucide-react";
import { SkeletonList } from "../../components/common/Skeleton";

const ROLES = [
  { value: "", label: "All roles" },
  { value: "founder", label: "Founder" },
  { value: "developer", label: "Developer" },
  { value: "mentor", label: "Mentor" },
  { value: "investor", label: "Investor" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, usersStatus, error } = useSelector((state) => state.admin);
  const [role, setRole] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = (filters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    dispatch(fetchAdminUsers(params));
  };

  useEffect(() => {
    dispatch(clearAdminError());
    load({});
  }, [dispatch]);

  const handleFilter = (e) => {
    e.preventDefault();
    load({ role });
  };

  const handleBlock = async (u) => {
    if (!window.confirm(`Block ${u.name}? They will not be able to log in.`)) return;
    setBusyId(u._id);
    await dispatch(blockUser(u._id));
    setBusyId(null);
  };

  const handleUnblock = async (u) => {
    setBusyId(u._id);
    await dispatch(unblockUser(u._id));
    setBusyId(null);
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    setBusyId(u._id);
    await dispatch(deleteUser(u._id));
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-xl font-semibold text-ink">Users</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        All registered accounts. Block, unblock, or remove.
      </p>

      <form onSubmit={handleFilter} className="mb-6 flex flex-wrap gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4" /> Filter
        </Button>
      </form>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {usersStatus === "loading" && users.length === 0 ? (
        <SkeletonList count={5} />
      ) : users.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">No users found.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <Card key={u._id} className="p-4">
              <div className="flex flex-wrap items-center gap-4">
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
                    <Badge tone="info">{u.role}</Badge>
                    {!u.isActive && <Badge tone="danger">Blocked</Badge>}
                    {u.isVerified && <Badge tone="success">Verified</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {u.role === "admin" ? (
                    <span className="text-xs text-muted">Admin — protected</span>
                  ) : (
                    <>
                      {u.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busyId === u._id}
                          onClick={() => handleBlock(u)}
                        >
                          Block
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busyId === u._id}
                          onClick={() => handleUnblock(u)}
                        >
                          Unblock
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        loading={busyId === u._id}
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}