import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTasks, updateTaskStatus } from "../../features/task/taskSlice";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const STATUSES = ["To-Do", "In Progress", "Done"];

export default function MyTasks() {
  const dispatch = useDispatch();
  const { myTasks, fetchStatus, error } = useSelector((state) => state.task);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  if (fetchStatus === "loading") {
    return <Loader label="Loading your tasks" full />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">My Tasks</h1>
      <p className="mb-6 text-sm text-muted">Tasks assigned to you across your teams.</p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {myTasks.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">No tasks assigned to you yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myTasks.map((task) => (
            <Card key={task._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-ink">{task.title}</h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted">{task.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {task.startup?.name}
                  </p>
                </div>
                <select
                  value={task.status}
                  onChange={(e) =>
                    dispatch(updateTaskStatus({ id: task._id, status: e.target.value }))
                  }
                  className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}