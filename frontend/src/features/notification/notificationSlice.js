import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/notifications");
      return res.data.data.notifications;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put("/notifications/read-all");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark all as read");
    }
  }
);

const initialState = {
  items: [], // newest first
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // A live push from the socket ("newNotification").
    notificationReceived: (state, action) => {
      if (state.items.some((n) => n._id === action.payload._id)) return;
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        // Merge instead of replacing: a live notification may have arrived
        // while this request was in flight, and a notification the user just
        // read must not flip back to unread (reads never revert).
        const local = new Map(state.items.map((n) => [n._id, n]));
        const fetched = action.payload.map((n) => ({
          ...n,
          isRead: n.isRead || local.get(n._id)?.isRead === true,
        }));
        const fetchedIds = new Set(fetched.map((n) => n._id));
        state.items = [...fetched, ...state.items.filter((n) => !fetchedIds.has(n._id))].sort(
          byNewest
        );
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload);
        if (item) item.isRead = true;
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Don't leave one user's notifications in memory for the next login.
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

// Derived, so the badge can never drift from the list. (The API returns the
// full list, so this equals the server's unreadCount.)
export const selectUnreadCount = (state) =>
  state.notification.items.filter((n) => !n.isRead).length;

export const { notificationReceived } = notificationSlice.actions;
export default notificationSlice.reducer;
