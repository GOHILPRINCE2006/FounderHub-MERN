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

import AuthLayout from "../components/layout/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardShell from "./DashboardShell";
import FounderShell from "./founder/FounderShell";

export default function AppRoutes() {
  const dispatch = useDispatch();

  // Runs once on app load — checks if a valid session cookie already
  // exists (e.g. user refreshed the page) via GET /auth/me.
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
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["founder"]} />}>
          <Route element={<FounderShell />}>
            <Route path="/founder/startup" element={<CreateStartup />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}