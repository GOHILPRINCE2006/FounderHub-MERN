import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../features/auth/authSlice";
import useLiveNotifications from "../features/notification/useLiveNotifications";
import BrowseStartups from "../pages/developer/BrowseStartups";
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
import MentorFeedback from "../pages/founder/mentorFeedback";
import MentorQueue from "../pages/mentor/MentorQueue";
import InvestorRequests from "../pages/founder/InvestorRequests";
import DiscoverStartups from "../pages/investor/DiscoverStartups";
import InvestorStartupDetail from "../pages/investor/InvestorStartupDetail";
import MyRequests from "../pages/investor/MyRequests";
import Profile from "../pages/profile/Profile";
import StartupProgress from "../pages/founder/StartupProgress";
import AuthLayout from "../components/layout/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardShell from "./DashboardShell";
import FounderShell from "./founder/FounderShell";
import MentorShell from "./mentor/MentorShell";
import InvestorShell from "./investor/InvestorShell";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminShell from "./admin/AdminShell";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminStartups from "../pages/admin/AdminStartups";
import AdminVerifications from "../pages/admin/AdminVerifications";

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
        <Route element={<DashboardShell />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/opportunities" element={<BrowseOpportunities />} />
          <Route path="/opportunities/:id" element={<StartupDetail />} />
          <Route path="/browse-startups" element={<BrowseStartups />} />   {/* NEW */}
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/chat" element={<TeamChat />} />
          <Route path="/profile" element={<Profile />} />
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
            <Route path="/founder/progress" element={<StartupProgress />} />
            <Route path="/founder/chat" element={<TeamChat />} />
            <Route path="/founder/mentors" element={<MentorFeedback />} />
            <Route path="/founder/investors" element={<InvestorRequests />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route element={<MentorShell />}>
            <Route path="/mentor/queue" element={<MentorQueue />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["investor"]} />}>
          <Route element={<InvestorShell />}>
            <Route path="/investor/startups" element={<DiscoverStartups />} />
            <Route
              path="/investor/startups/:id"
              element={<InvestorStartupDetail />}
            />
            <Route path="/investor/requests" element={<MyRequests />} />
          </Route>
        </Route>
      </Route>

    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route element={<AdminShell />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/startups" element={<AdminStartups />} />
    <Route path="/admin/verifications" element={<AdminVerifications />} />
    </Route>
  </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}