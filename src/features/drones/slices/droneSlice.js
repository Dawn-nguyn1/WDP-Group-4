import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchDronesAPI,
  createDroneAPI,
  getDroneDetailAPI,
  updateDroneAPI,
  deleteDroneAPI,
} from "../services/droneApi";

export const fetchDrones = createAsyncThunk(
  "drones/fetchDrones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDronesAPI();
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch drones");
    }
  },
);

export const createDrone = createAsyncThunk(
  "drones/createDrone",
  async (droneData, { rejectWithValue }) => {
    try {
      const response = await createDroneAPI(droneData);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to create drone");
    }
  },
);

export const getDroneDetail = createAsyncThunk(
  "drones/getDroneDetail",
  async (id, { rejectWithValue }) => {
    try {
      console.log('=== GET DRONE DETAIL API ===');
      console.log('Drone ID:', id);
      
      const response = await getDroneDetailAPI(id);
      
      console.log('API Response:', response);
      console.log('Response data:', response?.data);
      console.log('Response type:', typeof response);
      console.log('=== END GET DRONE DETAIL ===');
      
      return response?.data || response;
    } catch (error) {
      console.error('GET DRONE DETAIL ERROR:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      return rejectWithValue(error?.message || "Failed to get drone detail");
    }
  },
);

export const updateDrone = createAsyncThunk(
  "drones/updateDrone",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateDroneAPI(id, data);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to update drone");
    }
  },
);

export const deleteDrone = createAsyncThunk(
  "drones/deleteDrone",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDroneAPI(id);
      return id;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to delete drone");
    }
  },
);

const initialState = {
  dronesList: [],
  currentDrone: null,
  isLoading: false,
  error: null,
};

const droneSlice = createSlice({
  name: "drones",
  initialState,
  reducers: {
    clearDroneError: (state) => {
      state.error = null;
    },
    clearCurrentDrone: (state) => {
      state.currentDrone = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDrones
      .addCase(fetchDrones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDrones.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dronesList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDrones.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createDrone
      .addCase(createDrone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDrone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dronesList.push(action.payload);
      })
      .addCase(createDrone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // getDroneDetail
      .addCase(getDroneDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDroneDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDrone = action.payload;
      })
      .addCase(getDroneDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateDrone
      .addCase(updateDrone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDrone.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.dronesList.findIndex(
          (d) => d._id === action.payload._id,
        );
        if (index !== -1) {
          state.dronesList[index] = action.payload;
        }
        if (state.currentDrone?._id === action.payload._id) {
          state.currentDrone = action.payload;
        }
      })
      .addCase(updateDrone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // deleteDrone
      .addCase(deleteDrone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDrone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dronesList = state.dronesList.filter(
          (d) => d._id !== action.payload,
        );
        if (state.currentDrone?._id === action.payload) {
          state.currentDrone = null;
        }
      })
      .addCase(deleteDrone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDroneError, clearCurrentDrone } = droneSlice.actions;

export const selectDronesList = (state) => state.drones.dronesList;
export const selectCurrentDrone = (state) => state.drones.currentDrone;
export const selectDronesLoading = (state) => state.drones.isLoading;
export const selectDronesError = (state) => state.drones.error;

export default droneSlice.reducer;
