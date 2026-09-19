import { io } from "socket.io-client";

// One shared Socket.io client for the whole app.
//
// - No URL passed: it connects to the page's own origin, and the Vite dev
//   server proxies /socket.io to the backend (see vite.config.js). Same idea
//   as the relative axios baseURL — no hard-coded ports anywhere.
// - withCredentials: sends the httpOnly JWT cookie during the handshake.
//   The server reads it in sockets/socket.js.
// - autoConnect: false: a page connects only when it needs to, which is
//   always after login, so the cookie exists by then.
export const socket = io({
  withCredentials: true,
  autoConnect: false,
});
