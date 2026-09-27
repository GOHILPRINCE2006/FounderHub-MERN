import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

// --- Founder side ---

export const fetchEligibleInvestors = createAsyncThunk(
  "funding/fetchEligibleInvestors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/funding/eligible-investors");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load eligible investors"
      );
    }
  }
);

export const createFundingRequest = createAsyncThunk(
  "funding/createFundingRequest",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/funding", payload);
      await dispatch(fetchMyFundingRequests());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send funding request"
      );
    }
  }
);

export const fetchMyFundingRequests = createAsyncThunk(
  "funding/fetchMyFundingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/funding/my-requests");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load your funding requests"
      );
    }
  }
);

// --- Investor side ---

export const fetchReceivedFundingRequests = createAsyncThunk(
  "funding/fetchReceivedFundingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/funding/received");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load received funding requests"
      );
    }
  }
);

export const respondToFundingRequest = createAsyncThunk(
  "funding/respondToFundingRequest",
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/funding/${id}/${decision}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to respond to request"
      );
    }
  }
);

const initialState = {
  eligibleInvestors: [],
  eligibleStatus: "idle",

  myRequests: [],
  myRequestsStatus: "idle",

  received: [],
  receivedStatus: "idle",

  actionStatus: "idle",
  error: null,
};

const fundingSlice = createSlice({
  name: "funding",
  initialState,
  reducers: {
    clearFundingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEligibleInvestors.pending, (state) => {
        state.eligibleStatus = "loading";
      })
      .addCase(fetchEligibleInvestors.fulfilled, (state, action) => {
        state.eligibleStatus = "succeeded";
        state.eligibleInvestors = action.payload;
      })
      .addCase(fetchEligibleInvestors.rejected, (state, action) => {
        state.eligibleStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchMyFundingRequests.pending, (state) => {
        state.myRequestsStatus = "loading";
      })
      .addCase(fetchMyFundingRequests.fulfilled, (state, action) => {
        state.myRequestsStatus = "succeeded";
        state.myRequests = action.payload;
      })
      .addCase(fetchMyFundingRequests.rejected, (state, action) => {
        state.myRequestsStatus = "failed";
        state.error = action.payload;
      })

      .addCase(createFundingRequest.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createFundingRequest.fulfilled, (state) => {
        state.actionStatus = "succeeded";
      })
      .addCase(createFundingRequest.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchReceivedFundingRequests.pending, (state) => {
        state.receivedStatus = "loading";
      })
      .addCase(fetchReceivedFundingRequests.fulfilled, (state, action) => {
        state.receivedStatus = "succeeded";
        state.received = action.payload;
      })
      .addCase(fetchReceivedFundingRequests.rejected, (state, action) => {
        state.receivedStatus = "failed";
        state.error = action.payload;
      })

      .addCase(respondToFundingRequest.fulfilled, (state, action) => {
        const idx = state.received.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.received[idx] = {
            ...state.received[idx],
            status: action.payload.status,
            respondedAt: action.payload.respondedAt,
          };
        }
      })
      .addCase(respondToFundingRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearFundingError } = fundingSlice.actions;
export default fundingSlice.reducer;