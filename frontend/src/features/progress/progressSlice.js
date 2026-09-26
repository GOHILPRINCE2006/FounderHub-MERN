import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchStartupProgress = createAsyncThunk(
  "progress/fetchStartupProgress",
  async (startupId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/progress/startup/${startupId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load progress"
      );
    }
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    data: null,
    fetchStatus: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    clearProgress: (state) => {
      state.data = null;
      state.fetchStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStartupProgress.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchStartupProgress.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchStartupProgress.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;