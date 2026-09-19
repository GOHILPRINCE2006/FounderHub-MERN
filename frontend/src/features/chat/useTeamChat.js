import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../../api/socket";
import {
  openRoom,
  fetchChatHistory,
  messageReceived,
  setConnectionStatus,
  setChatError,
} from "./chatSlice";

/**
 * Connects the shared socket, joins one startup's chat room, loads history,
 * and feeds live messages into Redux. Everything is undone on cleanup.
 *
 * Server contract (backend/src/sockets/socket.js):
 *   emit  "joinStartupRoom" (startupId)            -> server answers "joinedRoom"
 *   emit  "sendMessage" ({ startupId, content })   -> server broadcasts "newMessage"
 *   on    "errorMessage" (string)
 *
 * The socket is disconnected when the room changes or the page unmounts.
 * That drops the server-side room membership too, so a user who belongs to
 * several startups never receives messages from a room they are not viewing.
 */
export default function useTeamChat(startupId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!startupId) return undefined;

    dispatch(openRoom(startupId));
    dispatch(fetchChatHistory(startupId));
    dispatch(setConnectionStatus("connecting"));

    // Rooms are lost whenever the socket reconnects, so re-join on every "connect".
    const handleConnect = () => socket.emit("joinStartupRoom", startupId);
    const handleJoined = () => dispatch(setConnectionStatus("connected"));
    const handleDisconnect = () => dispatch(setConnectionStatus("disconnected"));
    const handleConnectError = (err) => {
      dispatch(setConnectionStatus("disconnected"));
      dispatch(setChatError(err.message || "Could not connect to chat"));
    };
    const handleNewMessage = (message) => dispatch(messageReceived(message));
    const handleServerError = (message) => dispatch(setChatError(message));

    socket.on("connect", handleConnect);
    socket.on("joinedRoom", handleJoined);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("newMessage", handleNewMessage);
    socket.on("errorMessage", handleServerError);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("joinedRoom", handleJoined);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newMessage", handleNewMessage);
      socket.off("errorMessage", handleServerError);
      socket.disconnect();
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
