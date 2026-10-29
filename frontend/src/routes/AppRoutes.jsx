import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../features/auth/authSlice";
import useLiveNotifications from "../features/notification/useLiveNotifications";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";
import DashboardHome from "../pages/dashboard/DashboardHome";
import BrowseOpportunities from "../pages/opportunities/BrowseOpportunities";
import StartupDetail from "../pages/opportunities/StartupDetail";
import BrowseStartups from "../pages/developer/BrowseStartups";
import MyApplications from "../pages/developer/MyApplications";
import MyTasks from "../pages/developer/MyTasks";
import TeamChat from "../pages/chat/TeamChat";
import Profile from "../pages/profile/Profile";

import ManageStartup from "../pages/founder/ManageStartup";
import RecruitmentPosts from "../pages/founder/RecruitmentPosts";
import ApplicationReview from "../pages/founder/ApplicationReview";
import KanbanBoard from "../pages/founder/KanbanBoard";
import StartupProgress from "../pages/founder/StartupProgress";
import MentorFeedback from "../pages/founder/mentorFeedback";
import BrowseInvestors from "../pages/founder/BrowseInvestors";

import MentorQueue from "../pages/mentor/MentorQueue";
import InvestorFundingRequests from "../pages/investor/Requests";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminStartups from "../pages/admin/AdminStartups";
import AdminVerifications from "../pages/admin/AdminVerifications";

import AuthLayout from "../components/layout/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

import MyMentorships from "../pages/founder/MyMentorships";

// Guard for /founder/:startupId/*
// "create" is a reserved word, never a real startup ID.
function StartupWorkspaceShell() {
  const { startupId } = useParams();
  if (startupId === "create") {
    return <Navigate to="/founder/create" replace />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useLiveNotifications();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* 1. Global Pages */}
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/opportunities" element={<BrowseOpportunities />} />
          <Route path="/opportunities/:id" element={<StartupDetail />} />
          <Route path="/browse-startups" element={<BrowseStartups />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/chat" element={<TeamChat />} />
          <Route path="/profile" element={<Profile />} />

          {/* 2. Founder Routes (create is strictly separate from :startupId) */}
          <Route element={<ProtectedRoute allowedRoles={["founder"]} />}>
            <Route path="/founder/create" element={<ManageStartup />} />

            <Route path="/founder/:startupId" element={<StartupWorkspaceShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StartupProgress />} />
              <Route path="settings" element={<ManageStartup />} />
              <Route path="recruitment" element={<RecruitmentPosts />} />
              <Route path="recruitment/:postId/applications" element={<ApplicationReview />} />
              <Route path="tasks" element={<KanbanBoard />} />
              <Route path="chat" element={<TeamChat />} />
              <Route path="mentors" element={<MentorFeedback />} />
              <Route path="my-mentorships" element={<MyMentorships />} />
              <Route path="investors" element={<BrowseInvestors />} />
            </Route>
          </Route>

          {/* 3. Mentor Routes */}
          <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
            <Route path="/mentor/queue" element={<MentorQueue />} />
          </Route>

          {/* 4. Investor Routes */}
          <Route element={<ProtectedRoute allowedRoles={["investor"]} />}>
            <Route path="/investor/requests" element={<InvestorFundingRequests />} />
          </Route>

          {/* 5. Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/startups" element={<AdminStartups />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}