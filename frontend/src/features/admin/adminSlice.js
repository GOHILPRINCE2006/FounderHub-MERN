import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// --- Stats ---
export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/stats");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load stats");
    }
  }
);

// --- Users ---
export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/users", { params: filters });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load users");
    }
  }
);

export const blockUser = createAsyncThunk(
  "admin/blockUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}/block`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to block user");
    }
  }
);

export const unblockUser = createAsyncThunk(
  "admin/unblockUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}/unblock`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to unblock user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

// --- Startups ---
export const fetchAdminStartups = createAsyncThunk(
  "admin/fetchStartups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/startups");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load startups");
    }
  }
);

export const hideStartup = createAsyncThunk(
  "admin/hideStartup",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/startups/${id}/hide`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to hide startup");
    }
  }
);

export const unhideStartup = createAsyncThunk(
  "admin/unhideStartup",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/startups/${id}/unhide`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to unhide startup");
    }
  }
);

export const deleteStartupAdmin = createAsyncThunk(
  "admin/deleteStartup",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/startups/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete startup");
    }
  }
);

// --- Verifications ---
export const fetchVerifications = createAsyncThunk(
  "admin/fetchVerifications",
  async (role, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/verifications", {
        params: { role },
      });
      return { role, users: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load verifications");
    }
  }
);

export const approveVerification = createAsyncThunk(
  "admin/approveVerification",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/verifications/${userId}/approve`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to approve");
    }
  }
);

export const revokeVerification = createAsyncThunk(
  "admin/revokeVerification",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/verifications/${userId}/revoke`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to revoke");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: null,
    statsStatus: "idle",

    users: [],
    usersStatus: "idle",

    startups: [],
    startupsStatus: "idle",

    verifications: { mentor: [], investor: [] },
    verificationsStatus: "idle",

    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsStatus = "loading";
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.statsStatus = "failed";
        state.error = action.payload;
      })

      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = "loading";
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersStatus = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersStatus = "failed";
        state.error = action.payload;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], ...action.payload };
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], ...action.payload };
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      // Startups
      .addCase(fetchAdminStartups.pending, (state) => {
        state.startupsStatus = "loading";
      })
      .addCase(fetchAdminStartups.fulfilled, (state, action) => {
        state.startupsStatus = "succeeded";
        state.startups = action.payload;
      })
      .addCase(fetchAdminStartups.rejected, (state, action) => {
        state.startupsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(hideStartup.fulfilled, (state, action) => {
        const idx = state.startups.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.startups[idx] = { ...state.startups[idx], ...action.payload };
      })
      .addCase(unhideStartup.fulfilled, (state, action) => {
        const idx = state.startups.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.startups[idx] = { ...state.startups[idx], ...action.payload };
      })
      .addCase(deleteStartupAdmin.fulfilled, (state, action) => {
        state.startups = state.startups.filter((s) => s._id !== action.payload);
      })

      // Verifications
      .addCase(fetchVerifications.pending, (state) => {
        state.verificationsStatus = "loading";
      })
      .addCase(fetchVerifications.fulfilled, (state, action) => {
        state.verificationsStatus = "succeeded";
        state.verifications[action.payload.role] = action.payload.users;
      })
      .addCase(fetchVerifications.rejected, (state, action) => {
        state.verificationsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(approveVerification.fulfilled, (state, action) => {
        const role = action.payload.role;
        if (state.verifications[role]) {
          state.verifications[role] = state.verifications[role].filter(
            (u) => u._id !== action.payload._id
          );
        }
      })
      .addCase(revokeVerification.fulfilled, (state, action) => {
        const role = action.payload.role;
        if (state.verifications[role]) {
          state.verifications[role] = state.verifications[role].filter(
            (u) => u._id !== action.payload._id
          );
        }
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;