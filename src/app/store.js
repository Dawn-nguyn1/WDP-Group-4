import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import droneReducer from "../features/drones/slices/droneSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drones: droneReducer,
  },
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});
