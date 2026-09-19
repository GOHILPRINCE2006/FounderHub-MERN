import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasksForStartup,
  createTask,
  updateTaskStatus,
  deleteTask,
  clearTaskError,
} from "../../features/task/taskSlice";
import { fetchMyStartup } from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const STATUSES = ["To-Do", "In Progress", "Done"];

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const { myStartup } = useSelector((state) => state.startup);
  const { startupTasks, fetchStatus, actionStatus, error } = useSelector(
    (state) => state.task
  );

  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!myStartup) {
      dispatch(fetchMyStartup());
    }
  }, [dispatch, myStartup]);

  useEffect(() => {
    if (myStartup?._id) {
      dispatch(fetchTasksForStartup(myStartup._id));
    }
  }, [dispatch, myStartup]);

  const onSubmit = async (data) => {
    dispatch(clearTaskError());
    const result = await dispatch(
      createTask({
        title: data.title,
        description: data.description,
        assignedMember: data.assignedMember || undefined,
        startupId: myStartup._id,
      })
    );
    if (createTask.fulfilled.match(result)) {
      reset();
      setShowForm(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this task?")) {
      dispatch(deleteTask(id));
    }
  };

  if (!myStartup) {
    return <Loader label="Loading startup" full />;
  }

  const columns = STATUSES.map((status) => ({
    status,
    tasks: startupTasks.filter((t) => t.status === status),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Task Board</h1>
          <p className="mt-1 text-sm text-muted">
            Manage tasks for {myStartup.name}.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Task"}
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Task Title"
              placeholder="e.g. Build login page"
              error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
            <Textarea
              label="Description"
              placeholder="Details about this task"
              {...register("description")}
              rows={2}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assignedMember" className="text-sm font-medium text-ink">
                Assign to (optional)
              </label>
              <select
                id="assignedMember"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                {...register("assignedMember")}
                defaultValue=""
              >
                <option value="">Unassigned</option>
                {myStartup.teamMembers?.map((member) => (
                  <option key={member._id || member} value={member._id || member}>
                    {member.name || member}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" loading={actionStatus === "loading"} className="mt-1">
              Create Task
            </Button>
          </form>
        </Card>
      )}

      {fetchStatus === "loading" ? (
        <Loader label="Loading tasks" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.status}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                {col.status} ({col.tasks.length})
              </h2>
              <div className="flex flex-col gap-3">
                {col.tasks.length === 0 ? (
                  <p className="text-sm text-muted">No tasks</p>
                ) : (
                  col.tasks.map((task) => (
                    <Card key={task._id}>
                      <h3 className="font-medium text-ink">{task.title}</h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted">{task.description}</p>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        {task.assignedMember?.name
                          ? `Assigned to ${task.assignedMember.name}`
                          : "Unassigned"}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            dispatch(updateTaskStatus({ id: task._id, status: e.target.value }))
                          }
                          className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </Button>
                      </div>
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