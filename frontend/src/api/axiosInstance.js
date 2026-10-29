import axios from "axios";

// baseURL is relative ("/api/v1") on purpose — the Vite dev server proxies
// this to http://localhost:5000 (see vite.config.js), and in production
// the frontend is expected to be served from the same origin as the API.
const axiosInstance = axios.create({
  // Same-origin by default. Set VITE_API_URL (e.g. https://api.myapp.com) only
  // when the backend is hosted on a different domain than the frontend.
  baseURL: `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/v1`,
  withCredentials: true, // required: auth is via httpOnly cookie, not a bearer token
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;