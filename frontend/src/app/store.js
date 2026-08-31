import { configureStore } from "@reduxjs/toolkit";

// Feature slices are added here as each phase builds them
// (auth in Phase 14.2, notifications later, etc). Redux Toolkit is used
// only where global state genuinely helps — most page-level data fetching
// will stay local to that page/component.
export const store = configureStore({
  reducer: {},
});