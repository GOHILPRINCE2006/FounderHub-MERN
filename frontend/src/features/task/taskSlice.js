import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Tasks for a specific startup (founder or team member view — same
// endpoint, backend authorizes based on relationship, not role).
export const fetchTasksForStartup = createAsyncThunk(
  "task/fetchTasksForStartup",
  async (startupId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/tasks/startup/${startupId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load tasks");
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  "task/fetchMyTasks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/tasks/my-tasks");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your tasks");
    }
  }
);

export const createTask = createAsyncThunk(
  "task/createTask",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/tasks", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create task");
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "task/updateTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/tasks/${id}/status`, { status });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "task/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete task");
    }
  }
);

const taskSlice = createSlice({
  name: "task",
  initialState: {
    startupTasks: [],
    myTasks: [],
    fetchStatus: "idle",
    actionStatus: "idle",
    error: null,
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksForStartup.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchTasksForStartup.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.startupTasks = action.payload;
      })
      .addCase(fetchTasksForStartup.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyTasks.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.myTasks = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.startupTasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updateInList = (list) => {
          const idx = list.findIndex((t) => t._id === action.payload._id);
          if (idx !== -1) list[idx] = action.payload;
        };
        updateInList(state.startupTasks);
        updateInList(state.myTasks);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.startupTasks = state.startupTasks.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;