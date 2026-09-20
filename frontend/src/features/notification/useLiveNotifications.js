import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../api/socket";
import { fetchNotifications, notificationReceived } from "./notificationSlice";

/**
 * Owns the app-wide socket connection for as long as someone is logged in,
 * and keeps the notification list current. Call it once, high in the tree
 * (AppRoutes).
 *
 * - Logs in  -> connect the shared socket (the server puts it in a personal
 *   room, so "newNotification" pushes reach only this user) and load the list.
 * - Logs out -> disconnect.
 * - Reconnect after a drop -> reload the list, since pushes sent while the
 *   socket was down are gone.
 *
 * The team chat page does not connect or disconnect; it only joins a room on
 * this same socket (see features/chat/useTeamChat.js).
 */
export default function useLiveNotifications() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    if (!userId) return undefined;

    const handleNew = (notification) => dispatch(notificationReceived(notification));
    const handleReconnect = () => dispatch(fetchNotifications());

    socket.on("newNotification", handleNew);
    socket.io.on("reconnect", handleReconnect);

    dispatch(fetchNotifications());
    socket.connect();

    return () => {
      socket.off("newNotification", handleNew);
      socket.io.off("reconnect", handleReconnect);
      socket.disconnect();
    };
  }, [userId, dispatch]);
}
