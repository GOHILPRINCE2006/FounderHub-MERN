import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

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

// Browse — public list, supports the same query params as the backend
// (keyword, industry, stage, skills, role).
export const fetchAllStartups = createAsyncThunk(
  "startup/fetchAllStartups",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/startups", { params: filters });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load startups");
    }
  }
);

export const fetchStartupById = createAsyncThunk(
  "startup/fetchStartupById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/startups/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load startup");
    }
  }
);

const startupSlice = createSlice({
  name: "startup",
  initialState: {
    myStartup: null,
    fetchStatus: "idle",
    actionStatus: "idle",
    error: null,
    // Browse/detail state — separate from myStartup so a founder browsing
    // other startups doesn't clobber their own startup's data.
    allStartups: [],
    browseStatus: "idle",
    activeStartup: null,
    detailStatus: "idle",
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
      })
      .addCase(fetchAllStartups.pending, (state) => {
        state.browseStatus = "loading";
      })
      .addCase(fetchAllStartups.fulfilled, (state, action) => {
        state.browseStatus = "succeeded";
        state.allStartups = action.payload;
      })
      .addCase(fetchAllStartups.rejected, (state, action) => {
        state.browseStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchStartupById.pending, (state) => {
        state.detailStatus = "loading";
      })
      .addCase(fetchStartupById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.activeStartup = action.payload;
      })
      .addCase(fetchStartupById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearStartupError } = startupSlice.actions;
export default startupSlice.reducer;