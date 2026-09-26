import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import startupReducer from "../features/startup/startupSlice";
import recruitmentReducer from "../features/recruitment/recruitmentSlice";
import applicationReducer from "../features/application/applicationSlice";
import taskReducer from "../features/task/taskSlice";
import profileReducer from "../features/profile/profileSlice";
import chatReducer from "../features/chat/chatSlice";
import mentorReducer from "../features/mentor/mentorSlice";
import investorReducer from "../features/investor/investorSlice";
import notificationReducer from "../features/notification/notificationSlice";
import progressReducer from "../features/progress/progressSlice";
import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    startup: startupReducer,
    recruitment: recruitmentReducer,
    application: applicationReducer,
    task: taskReducer,
    profile: profileReducer,
    chat: chatReducer,
    mentor: mentorReducer,
    investor: investorReducer,
    notification: notificationReducer,
    progress: progressReducer,
    admin: adminReducer,
  },
});