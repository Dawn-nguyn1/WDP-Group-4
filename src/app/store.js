import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import droneReducer from "../features/drones/slices/droneSlice";
import flightPlanReducer from "../features/flight-plans/slices/flightPlanSlice";
import conflictReducer from "../features/conflicts/slices/conflictSlice";
import missionReducer from "../features/missions/slices/missionSlice";
import dashboardReducer from "../features/dashboard/slices/dashboardSlice";
import simulationReducer from "../features/simulation/slices/simulationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drones: droneReducer,
    flightPlans: flightPlanReducer,
    conflicts: conflictReducer,
    missions: missionReducer,
    dashboard: dashboardReducer,
    simulation: simulationReducer,
  },
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});
