import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../../api/socket";
import {
  openRoom,
  fetchChatHistory,
  messageReceived,
  setConnectionStatus,
  setChatError,
  clearChatError,
} from "./chatSlice";

/**
 * Joins one startup's chat room on the shared socket, loads history, and
 * feeds live messages into Redux. Everything is undone on cleanup.
 *
 * The socket itself is connected app-wide while logged in (see
 * features/notification/useLiveNotifications.js). This hook never connects or
 * disconnects it; it only joins a room and listens.
 *
 * Server contract (backend/src/sockets/socket.js):
 *   emit  "joinStartupRoom" (startupId)            -> server answers "joinedRoom" (startupId)
 *   emit  "sendMessage" ({ startupId, content })   -> server broadcasts "newMessage"
 *   on    "errorMessage" (string)
 *
 * There is no "leave room" event, so a user who visited several teams stays
 * in those rooms server-side. That is harmless: each live message carries its
 * startupId and chatSlice drops the ones for rooms that aren't open.
 */
export default function useTeamChat(startupId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!startupId) return undefined;

    dispatch(openRoom(startupId));
    dispatch(fetchChatHistory(startupId));
    dispatch(setConnectionStatus("connecting"));

    const joinRoom = () => socket.emit("joinStartupRoom", startupId);
    const handleJoined = (joinedId) => {
      if (joinedId !== startupId) return; // an answer for a room we've since left
      dispatch(setConnectionStatus("connected"));
      dispatch(clearChatError());
    };
    const handleDisconnect = () => dispatch(setConnectionStatus("disconnected"));
    const handleConnectError = (err) => {
      dispatch(setConnectionStatus("disconnected"));
      dispatch(setChatError(err.message || "Could not connect to chat"));
    };
    const handleNewMessage = (message) => dispatch(messageReceived(message));
    const handleServerError = (message) => dispatch(setChatError(message));

    // Rooms are lost whenever the socket reconnects, so re-join on every "connect".
    socket.on("connect", joinRoom);
    socket.on("joinedRoom", handleJoined);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("newMessage", handleNewMessage);
    socket.on("errorMessage", handleServerError);

    // Already connected (the usual case): join now. Otherwise the "connect"
    // listener above joins as soon as the app-level connection comes up.
    if (socket.connected) joinRoom();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("joinedRoom", handleJoined);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newMessage", handleNewMessage);
      socket.off("errorMessage", handleServerError);
      dispatch(setConnectionStatus("disconnected"));
    };
  }, [startupId, dispatch]);

  // Returns true if the message was handed to the socket.
  const sendMessage = useCallback(
    (content) => {
      const text = content.trim();
      if (!text || !startupId || !socket.connected) return false;
      socket.emit("sendMessage", { startupId, content: text });
      return true;
    },
    [startupId]
  );

  return { sendMessage };
}
