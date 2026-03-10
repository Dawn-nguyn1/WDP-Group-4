import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import droneReducer from "../features/drones/slices/droneSlice";
import flightPlanReducer from "../features/flight-plans/slices/flightPlanSlice";
import conflictReducer from "../features/conflicts/slices/conflictSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drones: droneReducer,
    flightPlans: flightPlanReducer,
    conflicts: conflictReducer,
  },
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});
