import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

// Browsing startups and opening one reuse startupSlice (fetchAllStartups /
// fetchStartupById). This slice only holds what is investor-specific.

// ---- Investor side ---------------------------------------------------

// Public: founder + team members of one startup.
export const fetchStartupTeam = createAsyncThunk(
  "investor/fetchStartupTeam",
  async (startupId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/investors/startups/${startupId}/team`);
      return { startupId, team: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load the team");
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  "investor/fetchMyRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/investors/my-requests");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your requests");
    }
  }
);

// The POST response only carries ids (no startup details), so after it
// succeeds we reload the investor's requests to get the populated list.
export const sendConnectionRequest = createAsyncThunk(
  "investor/sendConnectionRequest",
  async ({ startupId, message }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/investors/connect", { startupId, message });
      await dispatch(fetchMyRequests());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send request");
    }
  }
);

// ---- Founder side ----------------------------------------------------

export const fetchReceivedRequests = createAsyncThunk(
  "investor/fetchReceivedRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/investors/received");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load investor requests");
    }
  }
);

// decision: "accept" | "reject"
export const respondToRequest = createAsyncThunk(
  "investor/respondToRequest",
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/investors/${id}/${decision}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to respond to the request");
    }
  }
);

const initialState = {
  team: null,
  teamFor: null, // startupId the loaded team belongs to
  teamStatus: "idle", // idle | loading | succeeded | failed
  myRequests: [],
  myRequestsStatus: "idle",
  received: [],
  receivedStatus: "idle",
  error: null,
};

const investorSlice = createSlice({
  name: "investor",
  initialState,
  reducers: {
    clearInvestorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStartupTeam.pending, (state) => {
        state.teamStatus = "loading";
      })
      .addCase(fetchStartupTeam.fulfilled, (state, action) => {
        state.teamStatus = "succeeded";
        state.team = action.payload.team;
        state.teamFor = action.payload.startupId;
      })
      .addCase(fetchStartupTeam.rejected, (state, action) => {
        state.teamStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyRequests.pending, (state) => {
        state.myRequestsStatus = "loading";
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.myRequestsStatus = "succeeded";
        state.myRequests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.myRequestsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.receivedStatus = "loading";
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.receivedStatus = "succeeded";
        state.received = action.payload;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.receivedStatus = "failed";
        state.error = action.payload;
      })
      // The accept/reject response populates a different shape than the
      // received list (whole startup, investor as a bare id), so update only
      // the fields that changed instead of swapping the whole item.
      .addCase(respondToRequest.fulfilled, (state, action) => {
        const item = state.received.find((r) => r._id === action.payload._id);
        if (item) {
          item.status = action.payload.status;
          item.updatedAt = action.payload.updatedAt;
        }
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Don't leave one user's data in memory for the next login.
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearInvestorError } = investorSlice.actions;
export default investorSlice.reducer;
