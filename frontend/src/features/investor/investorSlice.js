import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

// --- Founder side ---

export const fetchVerifiedInvestors = createAsyncThunk(
  "investor/fetchVerifiedInvestors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/investors");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load investors");
    }
  }
);

export const sendInvestmentRequest = createAsyncThunk(
  "investor/sendInvestmentRequest",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/investors/request", payload);
      await dispatch(fetchMyInvestmentRequests());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send request");
    }
  }
);

export const fetchMyInvestmentRequests = createAsyncThunk(
  "investor/fetchMyInvestmentRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/investors/my-requests");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your requests");
    }
  }
);

export const withdrawInvestmentRequest = createAsyncThunk(
  "investor/withdrawInvestmentRequest",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/investors/requests/${id}/withdraw`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to withdraw request");
    }
  }
);

// --- Investor side ---

export const fetchReceivedInvestmentRequests = createAsyncThunk(
  "investor/fetchReceivedInvestmentRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/investors/received");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load received requests");
    }
  }
);

export const respondToInvestmentRequest = createAsyncThunk(
  "investor/respondToInvestmentRequest",
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/investors/requests/${id}/${decision}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to respond");
    }
  }
);

// --- Investment payment ---

export const createInvestmentOrder = createAsyncThunk(
  "investor/createInvestmentOrder",
  async ({ investorConnectionId, amount, equityPercent }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/investment/create-order", {
        investorConnectionId,
        amount,
        equityPercent,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create order");
    }
  }
);

export const verifyInvestmentPayment = createAsyncThunk(
  "investor/verifyInvestmentPayment",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/investment/verify", payload);
      await dispatch(fetchReceivedInvestmentRequests());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Verification failed");
    }
  }
);

const initialState = {
  investors: [],
  investorsStatus: "idle",

  myRequests: [],
  myRequestsStatus: "idle",

  received: [],
  receivedStatus: "idle",

  actionStatus: "idle",
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
      .addCase(fetchVerifiedInvestors.pending, (state) => {
        state.investorsStatus = "loading";
      })
      .addCase(fetchVerifiedInvestors.fulfilled, (state, action) => {
        state.investorsStatus = "succeeded";
        state.investors = action.payload;
      })
      .addCase(fetchVerifiedInvestors.rejected, (state, action) => {
        state.investorsStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchMyInvestmentRequests.pending, (state) => {
        state.myRequestsStatus = "loading";
      })
      .addCase(fetchMyInvestmentRequests.fulfilled, (state, action) => {
        state.myRequestsStatus = "succeeded";
        state.myRequests = action.payload;
      })
      .addCase(fetchMyInvestmentRequests.rejected, (state, action) => {
        state.myRequestsStatus = "failed";
        state.error = action.payload;
      })

      .addCase(sendInvestmentRequest.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(sendInvestmentRequest.fulfilled, (state) => {
        state.actionStatus = "succeeded";
      })
      .addCase(sendInvestmentRequest.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(withdrawInvestmentRequest.fulfilled, (state, action) => {
        const idx = state.myRequests.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.myRequests[idx] = {
            ...state.myRequests[idx],
            status: action.payload.status,
            respondedAt: action.payload.respondedAt,
          };
        }
      })
      .addCase(withdrawInvestmentRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchReceivedInvestmentRequests.pending, (state) => {
        state.receivedStatus = "loading";
      })
      .addCase(fetchReceivedInvestmentRequests.fulfilled, (state, action) => {
        state.receivedStatus = "succeeded";
        state.received = action.payload;
      })
      .addCase(fetchReceivedInvestmentRequests.rejected, (state, action) => {
        state.receivedStatus = "failed";
        state.error = action.payload;
      })

      .addCase(respondToInvestmentRequest.fulfilled, (state, action) => {
        const idx = state.received.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.received[idx] = {
            ...state.received[idx],
            status: action.payload.status,
            respondedAt: action.payload.respondedAt,
          };
        }
      })
      .addCase(respondToInvestmentRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearInvestorError } = investorSlice.actions;
export default investorSlice.reducer;