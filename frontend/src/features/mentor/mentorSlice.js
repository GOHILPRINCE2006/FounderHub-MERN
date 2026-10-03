import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

// --- Founder side ---

export const fetchMentors = createAsyncThunk(
  "mentor/fetchMentors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/mentors");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load mentors");
    }
  }
);

export const fetchMyMentorRequests = createAsyncThunk(
  "mentor/fetchMyMentorRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/mentors/my-requests");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your requests");
    }
  }
);

export const requestMentor = createAsyncThunk(
  "mentor/requestMentor",
  async ({ mentorId, message }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/mentors/request", { mentorId, message });
      await dispatch(fetchMyMentorRequests());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send request");
    }
  }
);

// --- Mentor side ---

export const fetchMentorQueue = createAsyncThunk(
  "mentor/fetchMentorQueue",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/mentors/queue");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your queue");
    }
  }
);

export const acceptMentorRequest = createAsyncThunk(
  "mentor/acceptMentorRequest",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/mentors/requests/${id}/accept`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to accept");
    }
  }
);

export const declineMentorRequest = createAsyncThunk(
  "mentor/declineMentorRequest",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/mentors/requests/${id}/decline`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to decline");
    }
  }
);

// --- Payment ---

export const createPaymentOrder = createAsyncThunk(
  "mentor/createPaymentOrder",
  async (mentorRequestId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/mentor/create-order", { mentorRequestId });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create order");
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "mentor/verifyPayment",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/mentor/verify", payload);
      await dispatch(fetchMyMentorRequests());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Payment verification failed");
    }
  }
);

const initialState = {
  mentors: [],
  mentorsStatus: "idle",

  myRequests: [],
  myRequestsStatus: "idle",

  queue: [],
  queueStatus: "idle",

  actionStatus: "idle",
  error: null,
};

const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {
    clearMentorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMentors.pending, (state) => {
        state.mentorsStatus = "loading";
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.mentorsStatus = "succeeded";
        state.mentors = action.payload;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.mentorsStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchMyMentorRequests.pending, (state) => {
        state.myRequestsStatus = "loading";
      })
      .addCase(fetchMyMentorRequests.fulfilled, (state, action) => {
        state.myRequestsStatus = "succeeded";
        state.myRequests = action.payload;
      })
      .addCase(fetchMyMentorRequests.rejected, (state, action) => {
        state.myRequestsStatus = "failed";
        state.error = action.payload;
      })

      .addCase(requestMentor.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(requestMentor.fulfilled, (state) => {
        state.actionStatus = "succeeded";
      })
      .addCase(requestMentor.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchMentorQueue.pending, (state) => {
        state.queueStatus = "loading";
      })
      .addCase(fetchMentorQueue.fulfilled, (state, action) => {
        state.queueStatus = "succeeded";
        state.queue = action.payload;
      })
      .addCase(fetchMentorQueue.rejected, (state, action) => {
        state.queueStatus = "failed";
        state.error = action.payload;
      })

      .addCase(acceptMentorRequest.fulfilled, (state, action) => {
        const idx = state.queue.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.queue[idx] = {
            ...state.queue[idx],
            status: action.payload.status,
            respondedAt: action.payload.respondedAt,
          };
        }
      })
      .addCase(acceptMentorRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(declineMentorRequest.fulfilled, (state, action) => {
        const idx = state.queue.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.queue[idx] = {
            ...state.queue[idx],
            status: action.payload.status,
            respondedAt: action.payload.respondedAt,
          };
        }
      })
      .addCase(declineMentorRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearMentorError } = mentorSlice.actions;
export default mentorSlice.reducer;