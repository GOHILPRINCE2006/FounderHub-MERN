import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader";

// Guards dashboard routes. Waits for the initial session check
// (fetchCurrentUser, dispatched once on app load) before deciding,
// so a page refresh doesn't briefly bounce a logged-in user to /login.
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, sessionChecked, user } = useSelector((state) => state.auth);

  if (!sessionChecked) {
    return <Loader label="Checking session" full />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}