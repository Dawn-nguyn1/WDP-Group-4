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
        // Store the live drone data separately
        if (response?.run) {
          state.currentRun = response.run;
        }
        state.liveDrones = response?.live?.drones || [];
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

export default simulationSlice.reducer;
