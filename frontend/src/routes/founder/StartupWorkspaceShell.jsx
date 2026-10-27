import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Navigate } from "react-router-dom";
import { fetchMyStartups } from "../../features/startup/startupSlice";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loader from "../../components/common/Loader";

export default function StartupWorkspaceShell() {
  const { startupId } = useParams();
  const dispatch = useDispatch();
  const { myStartups, fetchStatus } = useSelector((state) => state.startup);

  useEffect(() => {
    if (myStartups.length === 0) {
      dispatch(fetchMyStartups());
    }
  }, [dispatch, myStartups.length]);

  if (fetchStatus === "loading" || (myStartups.length === 0 && fetchStatus !== "failed")) {
    return <Loader label="Loading workspace" full />;
  }

  const activeStartup = myStartups.find((s) => s._id === startupId);
  if (!activeStartup) {
    return <Navigate to="/dashboard" replace />; 
  }

  return <DashboardLayout />;
}