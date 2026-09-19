import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../features/auth/authSlice";

import Landing from "../pages/Landing";
import NotFound from "../pages/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import DashboardHome from "../pages/dashboard/DashboardHome";
import CreateStartup from "../pages/founder/CreateStartup";
import RecruitmentPosts from "../pages/founder/RecruitmentPosts";
import ApplicationReview from "../pages/founder/ApplicationReview";
import KanbanBoard from "../pages/founder/KanbanBoard";
import BrowseOpportunities from "../pages/opportunities/BrowseOpportunities";
import StartupDetail from "../pages/opportunities/StartupDetail";
import MyApplications from "../pages/developer/MyApplications";
import MyTasks from "../pages/developer/MyTasks";
import TeamChat from "../pages/chat/TeamChat";

import AuthLayout from "../components/layout/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardShell from "./DashboardShell";
import FounderShell from "./founder/FounderShell";

export default function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/opportunities" element={<BrowseOpportunities />} />
          <Route path="/opportunities/:id" element={<StartupDetail />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/chat" element={<TeamChat />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["founder"]} />}>
          <Route element={<FounderShell />}>
            <Route path="/founder/startup" element={<CreateStartup />} />
            <Route path="/founder/recruitment" element={<RecruitmentPosts />} />
            <Route
              path="/founder/recruitment/:postId/applications"
              element={<ApplicationReview />}
            />
            <Route path="/founder/tasks" element={<KanbanBoard />} />
            <Route path="/founder/chat" element={<TeamChat />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}