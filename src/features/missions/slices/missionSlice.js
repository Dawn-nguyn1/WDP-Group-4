import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as missionApi from "../services/missionApi";

export const fetchMissions = createAsyncThunk(
  "missions/fetchMissions",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await missionApi.fetchMissionsAPI({ page, limit, search });
      console.log('🔍 API Response:', response);
      console.log('🔍 Response data:', response?.data);
      console.log('🔍 Response structure:', JSON.stringify(response, null, 2));
      return response;
    } catch (err) {
      console.error('❌ API Error:', err);
      return rejectWithValue(err);
    }
  },
);

export const getMissionDetail = createAsyncThunk(
  "missions/getDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await missionApi.getMissionDetailAPI(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const createMission = createAsyncThunk(
  "missions/create",
  async (data, { rejectWithValue }) => {
    try {
      return await missionApi.createMissionAPI(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const updateMission = createAsyncThunk(
  "missions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await missionApi.updateMissionAPI(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const deleteMission = createAsyncThunk(
  "missions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await missionApi.deleteMissionAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const assignMissionToDrone = createAsyncThunk(
  "missions/assignToDrone",
  async ({ missionId, droneId, scheduledTime }, { rejectWithValue }) => {
    try {
      return await missionApi.assignMissionToDroneAPI(missionId, droneId, scheduledTime);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const addFlightPlanToMission = createAsyncThunk(
  "missions/addFlightPlanToMission",
  async ({ missionId, data }, { rejectWithValue }) => {
    try {
      return await missionApi.addFlightPlanToMissionAPI(missionId, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const updateMissionPlan = createAsyncThunk(
  "missions/updateMissionPlan",
  async ({ missionId, missionPlanId, data }, { rejectWithValue }) => {
    try {
      return await missionApi.updateMissionPlanAPI(missionId, missionPlanId, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const startMission = createAsyncThunk(
  "missions/startMission",
  async (missionId, { rejectWithValue }) => {
    try {
      // Mock response for testing - remove this when backend is ready
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful response
        return {
          message: "Mission started successfully",
          mission: {
            _id: missionId,
            name: "Test Mission",
            description: "Test mission for start functionality",
            status: "ACTIVE", // Changed from DRAFT to ACTIVE
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };
      }
      
      return await missionApi.startMissionAPI(missionId);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

const initialState = {
  list: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
  currentMission: null,
  loading: false,
  error: null,
};

const missionSlice = createSlice({
  name: "missions",
  initialState,
  reducers: {
    clearCurrentMission: (state) => {
      state.currentMission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchMissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMissions.fulfilled, (state, action) => {
        console.log('✅ Fulfilled - Action payload:', action.payload);
        state.loading = false;
        const missionsList = action.payload.data || action.payload || [];
        state.list = missionsList;
        state.pagination = action.payload.pagination || state.pagination;
        console.log('✅ Updated missions list:', state.list);
        console.log('✅ Missions list length:', state.list.length);
      })
      .addCase(fetchMissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải dữ liệu missions";
      })

      // Get mission detail
      .addCase(getMissionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMissionDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMission = action.payload;
      })
      .addCase(getMissionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải chi tiết mission";
      })

      // Create mission
      .addCase(createMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMission.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Tạo mission thất bại";
      })

      // Update mission
      .addCase(updateMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentMission?._id === action.payload._id) {
          state.currentMission = action.payload;
        }
      })
      .addCase(updateMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật mission thất bại";
      })

      // Delete mission
      .addCase(deleteMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMission.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(m => m._id !== action.payload);
        if (state.currentMission?._id === action.payload) {
          state.currentMission = null;
        }
      })
      .addCase(deleteMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xóa mission thất bại";
      })

      // Add flight plan to mission
      .addCase(addFlightPlanToMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFlightPlanToMission.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh current mission to include new mission plan
        if (state.currentMission && state.currentMission.missionPlans) {
          state.currentMission.missionPlans.push(action.payload);
        }
      })
      .addCase(addFlightPlanToMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Thêm flight plan vào mission thất bại";
      })

      // Update mission plan
      .addCase(updateMissionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMissionPlan.fulfilled, (state, action) => {
        state.loading = false;
        // Update mission plan in current mission
        if (state.currentMission && state.currentMission.missionPlans) {
          const index = state.currentMission.missionPlans.findIndex(
            plan => plan._id === action.payload._id
          );
          if (index !== -1) {
            state.currentMission.missionPlans[index] = action.payload;
          }
        }
      })
      .addCase(updateMissionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật mission plan thất bại";
      })

      // Start mission
      .addCase(startMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startMission.fulfilled, (state, action) => {
        state.loading = false;
        // Update mission status to ACTIVE when started
        if (state.currentMission) {
          state.currentMission.mission.status = 'ACTIVE';
        }
        // Also update in missions list
        const index = state.list.findIndex(m => m._id === action.payload.mission._id);
        if (index !== -1) {
          state.list[index] = action.payload.mission;
        }
      })
      .addCase(startMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Bắt đầu mission thất bại";
      })

      // Assign mission to drone
      .addCase(assignMissionToDrone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignMissionToDrone.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(m => m._id === action.payload.mission._id);
        if (index !== -1) {
          state.list[index] = action.payload.mission;
        }
      })
      .addCase(assignMissionToDrone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Gán mission cho drone thất bại";
      });
  },
});

export const { clearCurrentMission } = missionSlice.actions;

export const selectMissionsList = (state) => state.missions.list;
export const selectCurrentMission = (state) => state.missions.currentMission;
export const selectMissionsLoading = (state) => state.missions.loading;
export const selectMissionsError = (state) => state.missions.error;

export default missionSlice.reducer;
