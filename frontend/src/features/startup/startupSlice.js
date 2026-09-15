import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Fetches the founder's own startup. A 404 here just means "not created
// yet" — that's a normal state for this app, not a real error, so we
// resolve it as `null` instead of rejecting.
export const fetchMyStartup = createAsyncThunk(
  "startup/fetchMyStartup",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/startups/my-startup");
      return res.data.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }
      return rejectWithValue(err.response?.data?.message || "Failed to load startup");
    }
  }
);

// formData is a real FormData instance (logo file + text fields) built
// by the CreateStartup page, since the backend expects multipart/form-data.
export const createStartup = createAsyncThunk(
  "startup/createStartup",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/startups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create startup");
    }
  }
);

export const updateStartup = createAsyncThunk(
  "startup/updateStartup",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/startups/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update startup");
    }
  }
);

const startupSlice = createSlice({
  name: "startup",
  initialState: {
    myStartup: null,
    fetchStatus: "idle", // idle | loading | succeeded | failed
    actionStatus: "idle", // for create/update submit button
    error: null,
  },
  reducers: {
    clearStartupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyStartup.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchMyStartup.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.myStartup = action.payload;
      })
      .addCase(fetchMyStartup.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createStartup.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createStartup.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.myStartup = action.payload;
      })
      .addCase(createStartup.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateStartup.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(updateStartup.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.myStartup = action.payload;
      })
      .addCase(updateStartup.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearStartupError } = startupSlice.actions;
export default startupSlice.reducer;