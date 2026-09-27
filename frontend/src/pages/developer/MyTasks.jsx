import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTasks, updateTaskStatus } from "../../features/task/taskSlice";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { SkeletonColumn } from "../../components/common/Skeleton";


const STATUSES = ["To-Do", "In Progress", "Done"];

const COLUMN_STYLE = {
  "To-Do":       "border-t-border-strong",
  "In Progress": "border-t-gold",
  Done:          "border-t-success",
};

export default function MyTasks() {
  const dispatch = useDispatch();
  const { myTasks, fetchStatus, error } = useSelector((state) => state.task);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  if (fetchStatus === "loading") {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-xl font-semibold text-ink">My Tasks</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Tasks assigned to you across your teams.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {["To-Do", "In Progress", "Done"].map((s) => (
            <div key={s}>
              <div className="mb-3 border-t-2 border-t-border-strong pt-3">
                <h2 className="text-sm font-semibold text-ink">{s}</h2>
              </div>
              <SkeletonColumn count={2} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const grouped = STATUSES.map((status) => ({
    status,
    tasks: myTasks.filter((t) => t.status === status),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-xl font-semibold text-ink">My Tasks</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Tasks assigned to you across your teams.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {myTasks.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No tasks assigned to you yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {grouped.map((col) => (
            <div key={col.status}>
              <div
                className={`mb-3 flex items-center justify-between border-t-2 ${COLUMN_STYLE[col.status]} pt-3`}
              >
                <h2 className="text-sm font-semibold text-ink">{col.status}</h2>
                <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">
                  {col.tasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {col.tasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted">
                    No tasks
                  </p>
                ) : (
                  col.tasks.map((task) => (
                    <Card key={task._id} className="p-4">
                      <h3 className="font-medium text-ink">{task.title}</h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted">{task.description}</p>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        {task.startup?.name}
                      </p>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          dispatch(
                            updateTaskStatus({ id: task._id, status: e.target.value })
                          )
                        }
                        className="mt-3 w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}