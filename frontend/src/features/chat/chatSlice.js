import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../auth/authSlice";

// Startups the current user can chat in (as founder or team member).
export const fetchMyTeams = createAsyncThunk(
  "chat/fetchMyTeams",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/startups/my-teams");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your teams");
    }
  }
);

// Message history for one startup (oldest first).
export const fetchChatHistory = createAsyncThunk(
  "chat/fetchChatHistory",
  async (startupId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/messages/startup/${startupId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load messages");
    }
  }
);

const initialState = {
  teams: [],
  teamsStatus: "idle", // idle | loading | succeeded | failed
  activeStartupId: null,
  messages: [],
  historyStatus: "idle",
  // "disconnected" | "connecting" | "connected" (connected = socket is up AND room joined)
  connectionStatus: "disconnected",
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Called when a chat room is opened (or switched). Resets the message list.
    openRoom: (state, action) => {
      state.activeStartupId = action.payload;
      state.messages = [];
      state.historyStatus = "loading";
      state.error = null;
    },
    // A live message from the socket. Ignore it if we already have it
    // (history and live messages can overlap right after connecting).
    messageReceived: (state, action) => {
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) state.messages.push(action.payload);
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setChatError: (state, action) => {
      state.error = action.payload;
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTeams.pending, (state) => {
        state.teamsStatus = "loading";
      })
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.teamsStatus = "succeeded";
        state.teams = action.payload;
      })
      .addCase(fetchMyTeams.rejected, (state, action) => {
        state.teamsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        // Ignore a late response for a room the user has already left.
        if (action.meta.arg !== state.activeStartupId) return;

        // Merge with any live messages that arrived while history was loading.
        const byId = new Map();
        [...action.payload, ...state.messages].forEach((m) => byId.set(m._id, m));
        state.messages = [...byId.values()].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        state.historyStatus = "succeeded";
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        if (action.meta.arg !== state.activeStartupId) return;
        state.historyStatus = "failed";
        state.error = action.payload;
      })
      // Never let one user's private messages linger in memory for the next login.
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const {
  openRoom,
  messageReceived,
  setConnectionStatus,
  setChatError,
  clearChatError,
} = chatSlice.actions;
export default chatSlice.reducer;
