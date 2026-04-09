import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as simulationApi from "../services/simulationApi";

// Start simulation
export const startSimulation = createAsyncThunk(
  "simulation/startSimulation",
  async ({ missionId, options }, { rejectWithValue }) => {
    try {
      const response = await simulationApi.startSimulationAPI(missionId, options);
      // Response shape based on docs: { message: "...", run: { runId, ... } }
      // We will save runId to localStorage
      if (response && response.run && response.run.runId) {
        localStorage.setItem("currentSimulationRunId", response.run.runId);
      }
      return response.run;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Stop simulation
export const stopSimulation = createAsyncThunk(
  "simulation/stopSimulation",
  async (runId, { rejectWithValue }) => {
    try {
      const response = await simulationApi.stopSimulationAPI(runId);
      return response.run;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Get simulation status (for polling)
export const getSimulationStatus = createAsyncThunk(
  "simulation/getStatus",
  async (runId, { rejectWithValue }) => {
    try {
      const response = await simulationApi.getSimulationStatusAPI(runId);
      return response.run;
    } catch (err) {
      // If run is not found anymore (404), we might want to clear local storage
      if (err.response?.status === 404) {
        localStorage.removeItem("currentSimulationRunId");
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Get simulation status by mission ID (alternative API with live drone data)
export const getMissionSimulationStatus = createAsyncThunk(
  "simulation/getMissionStatus",
  async (missionId, { rejectWithValue }) => {
    try {
      const response = await simulationApi.getMissionSimulationStatusAPI(missionId);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Helper to manually clear run from local storage and state
export const clearSimulation = () => (dispatch) => {
  localStorage.removeItem("currentSimulationRunId");
  dispatch(simulationSlice.actions.resetSimulation());
};

// Try to recover runId from local storage on load
const savedRunId = typeof window !== "undefined" ? localStorage.getItem("currentSimulationRunId") : null;

const initialState = {
  currentRun: savedRunId ? { runId: savedRunId, status: "UNKNOWN", logs: [] } : null,
  isStarting: false,
  isStopping: false,
  isPolling: false,
  error: null,
  liveDrones: [], // Store live drone data from mission status API
  missionStatusResponse: null, // Full response from mission status API
  flightType: null, // "manual" or "auto"
  completedAutoFlights: [], // Track completed automatic flights
};

const simulationSlice = createSlice({
  name: "simulation",
  initialState,
  reducers: {
    resetSimulation: (state) => {
      state.currentRun = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // startSimulation
      .addCase(startSimulation.pending, (state) => {
        state.isStarting = true;
        state.error = null;
      })
      .addCase(startSimulation.fulfilled, (state, action) => {
        state.isStarting = false;
        state.currentRun = action.payload; // Usually has RUNNING status and initial logs
      })
      .addCase(startSimulation.rejected, (state, action) => {
        state.isStarting = false;
        // Store the full error payload to access details later
        state.error = action.payload;
      })

      // stopSimulation
      .addCase(stopSimulation.pending, (state) => {
        state.isStopping = true;
        state.error = null;
      })
      .addCase(stopSimulation.fulfilled, (state, action) => {
        state.isStopping = false;
        // Updating current run status to whatever the API returned, usually STOPPING or STOPPED
        state.currentRun = action.payload;
      })
      .addCase(stopSimulation.rejected, (state, action) => {
        state.isStopping = false;
        state.error = action.payload?.message || "Failed to stop simulation";
      })

      // getSimulationStatus
      .addCase(getSimulationStatus.pending, (state) => {
        state.isPolling = true;
      })
      .addCase(getSimulationStatus.fulfilled, (state, action) => {
        state.isPolling = false;
        const newRunParams = action.payload;
        
        // Merge new data with existing logs to preserve log history
        if (state.currentRun && newRunParams.logs) {
          const existingLogIds = new Set(state.currentRun.logs?.map(log => log.id || `${log.ts}-${log.message}`));
          const newLogs = newRunParams.logs.filter(log => !existingLogIds.has(log.id || `${log.ts}-${log.message}`));
          
          state.currentRun = {
            ...newRunParams,
            logs: [...(state.currentRun.logs || []), ...newLogs]
          };
        } else {
          state.currentRun = newRunParams;
        }
      })
      .addCase(getSimulationStatus.rejected, (state, action) => {
        state.isPolling = false;
        state.error = action.payload?.message || "Failed to fetch simulation status";
        // If the simulation is completely gone, maybe reset
        if (action.payload?.message && typeof action.payload.message === "string" && action.payload.message.toLowerCase().includes("not found")) {
            state.currentRun = null;
        }
      })

      // getMissionSimulationStatus - alternative API with live drone data
      .addCase(getMissionSimulationStatus.fulfilled, (state, action) => {
        const response = action.payload;
        // Store the full response to detect flight type (manual vs auto)
        state.missionStatusResponse = response;
        
        // Detect flight type based on response structure
        const isManualFlight = response?.runId !== null && response?.runId !== undefined;
        const isAutoFlight = !isManualFlight && response?.source === "DATABASE";
        
        state.flightType = isManualFlight ? "manual" : isAutoFlight ? "auto" : null;
        
        // Store the live drone data separately
        if (response?.run) {
          state.currentRun = response.run;
        }
        state.liveDrones = response?.live?.drones || response?.run?.drones || [];
        
        // Track automatic flights (both IN_PROGRESS and COMPLETED)
        if (isAutoFlight && response?.run?.drones) {
          const missionId = response.run.missionId;
          // Include all drones with active or completed sessions
          const activeDrones = response.run.drones.filter(
            d => d.sessionStatus === "IN_PROGRESS" || 
                 d.sessionStatus === "COMPLETED" ||
                 d.sessionStatus === "RUNNING"
          );
          
          if (activeDrones.length > 0) {
            // Check if we already have this mission tracked
            const existingIndex = state.completedAutoFlights.findIndex(
              f => f.missionId === missionId
            );
            
            const flightData = {
              missionId,
              updatedAt: new Date().toISOString(),
              hasRun: response.hasRun,
              status: response.status,
              droneCount: activeDrones.length,
              drones: activeDrones.map(d => ({
                droneId: d.drone?.droneId,
                droneCode: d.drone?._id,
                sessionStatus: d.sessionStatus,
                actualStart: d.actualStart,
                actualEnd: d.actualEnd,
                flightSessionId: d.flightSessionId
              }))
            };
            
            if (existingIndex >= 0) {
              // Update existing entry
              state.completedAutoFlights[existingIndex] = flightData;
            } else {
              // Add new entry
              state.completedAutoFlights.push(flightData);
            }
          }
        }
      })
      .addCase(getMissionSimulationStatus.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to fetch mission simulation status";
      });
  },
});

export const { resetSimulation, clearError } = simulationSlice.actions;

export const selectCurrentRun = (state) => state.simulation.currentRun;
export const selectIsStarting = (state) => state.simulation.isStarting;
export const selectIsStopping = (state) => state.simulation.isStopping;
export const selectSimulationError = (state) => state.simulation.error;
export const selectLiveDrones = (state) => state.simulation.liveDrones;
export const selectFlightType = (state) => state.simulation.flightType;
export const selectMissionStatusResponse = (state) => state.simulation.missionStatusResponse;
export const selectCompletedAutoFlights = (state) => state.simulation.completedAutoFlights;

export default simulationSlice.reducer;
