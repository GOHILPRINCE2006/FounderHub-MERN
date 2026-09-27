import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats } from "../../features/admin/adminSlice";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonStats } from "../../components/common/Skeleton";
import {
  Users, Rocket, FileText, TrendingUp, ShieldCheck, Ban,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, tone = "default" }) {
  const toneClasses = {
    default: "bg-paper text-ink",
    gold: "bg-warning-bg text-gold-dark",
    danger: "bg-danger-bg text-danger",
    success: "bg-success-bg text-success",
    navy: "bg-navy/10 text-navy",
  };
  return (
    <Card className="p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, statsStatus, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (statsStatus === "loading" && !stats) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-xl font-semibold text-ink">
          Platform overview
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Loading live counts…
        </p>
        <SkeletonStats count={4} />
        <div className="mt-8">
          <SkeletonStats count={2} />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-5xl">
        <ErrorMessage message={error || "Failed to load stats"} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Platform overview
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Live counts across users, startups, and activity.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Users */}
      <h2 className="mb-3 font-display text-sm font-semibold text-ink">Users</h2>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Total" value={stats.users.total} tone="navy" />
        <StatCard icon={Users} label="Founders" value={stats.users.founders} />
        <StatCard icon={Users} label="Developers" value={stats.users.developers} />
        <StatCard icon={Users} label="Mentors" value={stats.users.mentors} />
        <StatCard icon={Users} label="Investors" value={stats.users.investors} />
        <StatCard icon={Ban} label="Blocked" value={stats.users.blocked} tone="danger" />
      </div>

      {/* Verifications */}
      <h2 className="mt-8 mb-3 font-display text-sm font-semibold text-ink">
        Pending verifications
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          icon={ShieldCheck}
          label="Mentors awaiting approval"
          value={stats.verifications.pendingMentors}
          tone="gold"
        />
        <StatCard
          icon={ShieldCheck}
          label="Investors awaiting approval"
          value={stats.verifications.pendingInvestors}
          tone="gold"
        />
      </div>

      {/* Startups */}
      <h2 className="mt-8 mb-3 font-display text-sm font-semibold text-ink">Startups</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard icon={Rocket} label="Total" value={stats.startups.total} tone="navy" />
        <StatCard icon={Ban} label="Hidden" value={stats.startups.hidden} tone="danger" />
      </div>

      {/* Activity */}
      <h2 className="mt-8 mb-3 font-display text-sm font-semibold text-ink">Activity</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Tasks" value={stats.activity.totalTasks} />
        <StatCard icon={FileText} label="Recruitment posts" value={stats.activity.totalRecruitmentPosts} />
        <StatCard icon={TrendingUp} label="Applications" value={stats.activity.totalApplications} />
        <StatCard icon={TrendingUp} label="Investor connections" value={stats.activity.totalInvestorConnections} />
      </div>
    </div>
  );
}