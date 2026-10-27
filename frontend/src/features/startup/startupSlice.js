import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchMyStartups = createAsyncThunk(
  "startup/fetchMyStartups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/startups/my-startups");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load startups");
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
    myStartups: [], // Array of startups owned by the founder
    fetchStatus: "idle",
    actionStatus: "idle",
    error: null,
    
    allStartups: [],
    browseStatus: "idle",
    activeStartup: null, // Used for public detail view
    detailStatus: "idle",
  },
  reducers: {
    clearStartupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All My Startups
      .addCase(fetchMyStartups.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchMyStartups.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.myStartups = action.payload;
      })
      .addCase(fetchMyStartups.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })

      // Create Startup
      .addCase(createStartup.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createStartup.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.myStartups.unshift(action.payload); // Add to the array
      })
      .addCase(createStartup.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // Update Startup
      .addCase(updateStartup.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(updateStartup.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const idx = state.myStartups.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.myStartups[idx] = action.payload;
      })
      .addCase(updateStartup.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      // Browse All Public Startups
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

      // Fetch Public Detail by ID
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