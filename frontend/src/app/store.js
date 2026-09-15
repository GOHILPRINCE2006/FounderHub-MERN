import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import startupReducer from "../features/startup/startupSlice";
import recruitmentReducer from "../features/recruitment/recruitmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    startup: startupReducer,
    recruitment: recruitmentReducer,
  },
});