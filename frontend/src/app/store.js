import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { logoutUser } from "../features/auth/authSlice";
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
import fundingReducer from "../features/funding/fundingSlice";

const appReducer = combineReducers({
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
    funding: fundingReducer,
});

// On logout wipe every slice except auth, so the next user who logs in on the
// same browser tab never sees the previous user's startups/requests/profile.
const rootReducer = (state, action) => {
  if (action.type === logoutUser.fulfilled.type && state) {
    state = { auth: state.auth };
  }
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });