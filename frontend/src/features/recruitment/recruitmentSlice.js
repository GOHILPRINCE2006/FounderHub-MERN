import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchMyRecruitmentPosts = createAsyncThunk(
  "recruitment/fetchMyPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/recruitments/my-posts");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load recruitment posts");
    }
  }
);

export const createRecruitmentPost = createAsyncThunk(
  "recruitment/createPost",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/recruitments", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create post");
    }
  }
);

export const updateRecruitmentPost = createAsyncThunk(
  "recruitment/updatePost",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/recruitments/${id}`, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update post");
    }
  }
);

export const deleteRecruitmentPost = createAsyncThunk(
  "recruitment/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/recruitments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete post");
    }
  }
);

const recruitmentSlice = createSlice({
  name: "recruitment",
  initialState: {
    myPosts: [],
    fetchStatus: "idle",
    actionStatus: "idle",
    error: null,
  },
  reducers: {
    clearRecruitmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRecruitmentPosts.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchMyRecruitmentPosts.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.myPosts = action.payload;
      })
      .addCase(fetchMyRecruitmentPosts.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createRecruitmentPost.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(createRecruitmentPost.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.myPosts.unshift(action.payload);
      })
      .addCase(createRecruitmentPost.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateRecruitmentPost.fulfilled, (state, action) => {
        const idx = state.myPosts.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.myPosts[idx] = action.payload;
      })
      .addCase(deleteRecruitmentPost.fulfilled, (state, action) => {
        state.myPosts = state.myPosts.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearRecruitmentError } = recruitmentSlice.actions;
export default recruitmentSlice.reducer;