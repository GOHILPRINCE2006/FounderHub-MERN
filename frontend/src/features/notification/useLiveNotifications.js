import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../api/socket";
import { fetchNotifications, notificationReceived } from "./notificationSlice";
import { refreshCurrentUser } from "../auth/authSlice";
import { fetchMentorQueue, fetchMyMentorRequests } from "../mentor/mentorSlice";
import { fetchReceivedInvestmentRequests, fetchMyInvestmentRequests } from "../investor/investorSlice";

export default function useLiveNotifications() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);
  const userRole = useSelector((state) => state.auth.user?.role); // <-- Get the role

  useEffect(() => {
    if (!userId) return undefined;

    const handleNew = (notification) => {
      dispatch(notificationReceived(notification));
      // verification result changes what the user may do -> re-sync the session user
      if (notification?.type?.startsWith("VERIFICATION_")) dispatch(refreshCurrentUser());
    };
    const handleReconnect = () => dispatch(fetchNotifications());

    const handleDataUpdate = () => {
      dispatch(fetchNotifications());
      
      // THE FIX: Only fetch data if the user has the correct role
      if (userRole === "mentor") {
        dispatch(fetchMentorQueue());
      } else if (userRole === "investor") {
        dispatch(fetchReceivedInvestmentRequests());
      } else if (userRole === "founder") {
        // mentor/investor accepted or was paid -> founder's request lists update live
        dispatch(fetchMyMentorRequests());
        dispatch(fetchMyInvestmentRequests());
      }
    };

    socket.on("newNotification", handleNew);
    socket.on("dataUpdated", handleDataUpdate);
    socket.io.on("reconnect", handleReconnect);

    dispatch(fetchNotifications());
    socket.connect();

    return () => {
      socket.off("newNotification", handleNew);
      socket.off("dataUpdated", handleDataUpdate);
      socket.io.off("reconnect", handleReconnect);
      socket.disconnect();
    };
  }, [userId, userRole, dispatch]);
}