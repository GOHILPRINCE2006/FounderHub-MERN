import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyStartup } from "../../features/startup/startupSlice";
import { fetchStartupProgress, clearProgress } from "../../features/progress/progressSlice";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  CheckCircle2, ListTodo, Loader2, Users, FileText, GraduationCap,
  TrendingUp, Activity,
} from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ACTIVITY_LABEL = {
  TASK_CREATED: "Task created",
  APPLICATION_SUBMITTED: "Application submitted",
  APPLICATION_ACCEPTED: "Application accepted",
  APPLICATION_REJECTED: "Application rejected",
  MENTOR_FEEDBACK_REQUESTED: "Mentor feedback requested",
  MENTOR_FEEDBACK_RECEIVED: "Mentor feedback received",
};

function StatCard({ icon: Icon, label, value, sublabel, tone = "default" }) {
  const toneClasses = {
    default: "bg-paper text-ink",
    gold: "bg-warning-bg text-gold-dark",
    success: "bg-success-bg text-success",
    navy: "bg-navy/10 text-navy",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs font-medium text-ink">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-muted">{sublabel}</p>}
    </Card>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
      <div
        className="h-full rounded-full bg-gold transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default function StartupProgress() {
  const dispatch = useDispatch();
  const { myStartup, fetchStatus: startupFetchStatus } = useSelector(
    (state) => state.startup
  );
  const { data, fetchStatus, error } = useSelector((state) => state.progress);

  useEffect(() => {
    dispatch(clearProgress());
    if (!myStartup) dispatch(fetchMyStartup());
  }, [dispatch, myStartup]);

  useEffect(() => {
    if (myStartup?._id) dispatch(fetchStartupProgress(myStartup._id));
  }, [dispatch, myStartup]);

  if (startupFetchStatus === "loading" || (!myStartup && fetchStatus !== "failed")) {
    return <Loader label="Loading progress" full />;
  }

  if (!myStartup) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-xl font-semibold text-ink">Progress</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Track your startup's momentum.
        </p>
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            Create your startup first to see progress.
          </p>
        </Card>
      </div>
    );
  }

  if (fetchStatus === "loading" && !data) {
    return <Loader label="Loading progress" full />;
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!data) return null;

  const { taskStats, teamContribution, recruitmentStats, activityTimeline } = data;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-xl font-semibold text-ink">Progress</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        How {myStartup.name} is moving.
      </p>

      {/* Stat row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label="Total tasks"
          value={taskStats.total}
          sublabel={`${taskStats.done} done · ${taskStats.inProgress} in progress`}
          tone="navy"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completion"
          value={`${taskStats.completionPercentage}%`}
          sublabel="Of all assigned tasks"
          tone="success"
        />
        <StatCard
          icon={FileText}
          label="Applications"
          value={recruitmentStats.totalApplications}
          sublabel={`${recruitmentStats.pending} pending`}
          tone="gold"
        />
        <StatCard
          icon={Users}
          label="Team members"
          value={teamContribution.length}
          sublabel="Contributing"
          tone="default"
        />
      </div>

      {/* Task breakdown */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Task breakdown
            </h2>
          </div>

          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">Completed</span>
            <span className="font-medium text-ink">
              {taskStats.done} / {taskStats.total}
            </span>
          </div>
          <ProgressBar value={taskStats.completionPercentage} />

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-paper p-3">
              <p className="font-display text-lg font-semibold text-ink">
                {taskStats.todo}
              </p>
              <p className="text-xs text-muted">To-Do</p>
            </div>
            <div className="rounded-lg bg-warning-bg p-3">
              <p className="font-display text-lg font-semibold text-gold-dark">
                {taskStats.inProgress}
              </p>
              <p className="text-xs text-muted">In Progress</p>
            </div>
            <div className="rounded-lg bg-success-bg p-3">
              <p className="font-display text-lg font-semibold text-success">
                {taskStats.done}
              </p>
              <p className="text-xs text-muted">Done</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Recruitment
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-paper p-3">
              <p className="font-display text-lg font-semibold text-ink">
                {recruitmentStats.openPosts}
              </p>
              <p className="text-xs text-muted">Open posts</p>
            </div>
            <div className="rounded-lg bg-paper p-3">
              <p className="font-display text-lg font-semibold text-ink">
                {recruitmentStats.closedPosts}
              </p>
              <p className="text-xs text-muted">Closed posts</p>
            </div>
            <div className="rounded-lg bg-warning-bg p-3">
              <p className="font-display text-lg font-semibold text-gold-dark">
                {recruitmentStats.pending}
              </p>
              <p className="text-xs text-muted">Pending</p>
            </div>
            <div className="rounded-lg bg-success-bg p-3">
              <p className="font-display text-lg font-semibold text-success">
                {recruitmentStats.accepted}
              </p>
              <p className="text-xs text-muted">Accepted</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team contribution */}
      <div className="mt-6">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Team contribution
            </h2>
          </div>

          {teamContribution.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">
              No assigned tasks yet. Assign tasks to see contribution.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {teamContribution.map((m) => (
                <div key={m.user._id} className="flex items-center gap-3">
                  {m.user.avatar ? (
                    <img
                      src={m.user.avatar}
                      alt={m.user.name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                      {m.user.name?.[0] || "?"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">
                        {m.user.name}
                      </p>
                      <span className="shrink-0 text-xs text-muted">
                        {m.completed} / {m.assigned} done
                      </span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar
                        value={m.assigned === 0 ? 0 : (m.completed / m.assigned) * 100}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Activity timeline */}
      <div className="mt-6">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Recent activity
            </h2>
          </div>

          {activityTimeline.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">
              No activity yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activityTimeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{event.message}</p>
                    <p className="text-xs text-muted">
                      {ACTIVITY_LABEL[event.type] || event.type} · {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}