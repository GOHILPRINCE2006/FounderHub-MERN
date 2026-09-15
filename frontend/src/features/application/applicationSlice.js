import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const applyToPost = createAsyncThunk(
  "application/applyToPost",
  async ({ postId, coverMessage }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/applications/${postId}`, { coverMessage });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit application");
    }
  }
);

export const fetchMyApplications = createAsyncThunk(
  "application/fetchMyApplications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/applications/my-applications");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load applications");
    }
  }
);

// Founder — applications for a specific recruitment post they own.
export const fetchApplicationsForPost = createAsyncThunk(
  "application/fetchApplicationsForPost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/applications/post/${postId}`);
      return { postId, applications: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load applications");
    }
  }
);

export const acceptApplication = createAsyncThunk(
  "application/acceptApplication",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/applications/${id}/accept`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to accept application");
    }
  }
);

export const rejectApplication = createAsyncThunk(
  "application/rejectApplication",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/applications/${id}/reject`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to reject application");
    }
  }
);

const applicationSlice = createSlice({
  name: "application",
  initialState: {
    myApplications: [],
    fetchStatus: "idle",
    applyStatus: "idle",
    error: null,
    // Founder-side: applications grouped by recruitment post id.
    byPostId: {},
    reviewStatus: "idle",
    actionStatus: "idle",
  },
  reducers: {
    clearApplicationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToPost.pending, (state) => {
        state.applyStatus = "loading";
        state.error = null;
      })
      .addCase(applyToPost.fulfilled, (state, action) => {
        state.applyStatus = "succeeded";
        state.myApplications.unshift(action.payload);
      })
      .addCase(applyToPost.rejected, (state, action) => {
        state.applyStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyApplications.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.myApplications = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchApplicationsForPost.pending, (state) => {
        state.reviewStatus = "loading";
      })
      .addCase(fetchApplicationsForPost.fulfilled, (state, action) => {
        state.reviewStatus = "succeeded";
        state.byPostId[action.payload.postId] = action.payload.applications;
      })
      .addCase(fetchApplicationsForPost.rejected, (state, action) => {
        state.reviewStatus = "failed";
        state.error = action.payload;
      })
      .addCase(acceptApplication.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(acceptApplication.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const postId = action.payload.recruitmentPost;
        const list = state.byPostId[postId];
        if (list) {
          const idx = list.findIndex((a) => a._id === action.payload._id);
          if (idx !== -1) list[idx] = action.payload;
        }
      })
      .addCase(acceptApplication.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        const postId = action.payload.recruitmentPost;
        const list = state.byPostId[postId];
        if (list) {
          const idx = list.findIndex((a) => a._id === action.payload._id);
          if (idx !== -1) list[idx] = action.payload;
        }
      });
  },
});

export const { clearApplicationError } = applicationSlice.actions;
export default applicationSlice.reducer;