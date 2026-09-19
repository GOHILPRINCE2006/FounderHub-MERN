import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

// ---- Founder side ----------------------------------------------------

// Public list of verified mentors.
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

// Every request the founder has sent (with mentor details) plus any feedback.
export const fetchReceivedFeedback = createAsyncThunk(
  "mentor/fetchReceivedFeedback",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/mentors/received");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your requests");
    }
  }
);

// The POST response only carries the mentor's id, so after it succeeds we
// reload the received list to get the new request with mentor details.
export const requestFeedback = createAsyncThunk(
  "mentor/requestFeedback",
  async (mentorId, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/mentors/request", { mentorId });
      await dispatch(fetchReceivedFeedback());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send request");
    }
  }
);

// ---- Mentor side -----------------------------------------------------

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

export const submitFeedback = createAsyncThunk(
  "mentor/submitFeedback",
  async ({ id, feedbackText }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/mentors/feedback/${id}`, { feedbackText });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit feedback");
    }
  }
);

const initialState = {
  mentors: [],
  mentorsStatus: "idle", // idle | loading | succeeded | failed
  received: [],
  receivedStatus: "idle",
  queue: [],
  queueStatus: "idle",
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
      .addCase(fetchReceivedFeedback.pending, (state) => {
        state.receivedStatus = "loading";
      })
      .addCase(fetchReceivedFeedback.fulfilled, (state, action) => {
        state.receivedStatus = "succeeded";
        state.received = action.payload;
      })
      .addCase(fetchReceivedFeedback.rejected, (state, action) => {
        state.receivedStatus = "failed";
        state.error = action.payload;
      })
      .addCase(requestFeedback.pending, (state) => {
        state.error = null;
      })
      .addCase(requestFeedback.rejected, (state, action) => {
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
      // The PUT response has a different populate shape than the queue items
      // (whole startup, no requestedBy), so update only the fields that changed.
      .addCase(submitFeedback.fulfilled, (state, action) => {
        const item = state.queue.find((r) => r._id === action.payload._id);
        if (item) {
          item.feedbackText = action.payload.feedbackText;
          item.status = action.payload.status;
          item.updatedAt = action.payload.updatedAt;
        }
      })
      // Don't leave one user's data in memory for the next login.
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearMentorError } = mentorSlice.actions;
export default mentorSlice.reducer;
