import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as missionApi from "../services/missionApi";

export const fetchMissions = createAsyncThunk(
  "missions/fetchMissions",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await missionApi.fetchMissionsAPI({ page, limit, search });
      return response;
    } catch (err) {
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
      console.log('🗑️ Deleting mission with ID:', id);
      await missionApi.deleteMissionAPI(id);
      console.log('✅ Mission deleted successfully:', id);
      return id;
    } catch (err) {
      console.error('❌ Error deleting mission:', err);
      console.error('❌ Error response:', err.response?.data);
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
      console.log('🚀 Adding flight plan to mission:', { missionId, data });
      const response = await missionApi.addFlightPlanToMissionAPI(missionId, data);
      console.log('✅ Flight plan added to mission - API response:', response);
      return response;
    } catch (err) {
      console.error('❌ Add flight plan to mission failed:', err);
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
      console.log('🚀 Starting mission with ID:', missionId);
      const response = await missionApi.startMissionAPI(missionId);
      console.log('✅ Start mission response:', response);
      return response;
    } catch (err) {
      console.error('❌ Error starting mission:', err);
      return rejectWithValue(err);
    }
  },
);

export const deleteMissionWithPlans = createAsyncThunk(
  "missions/deleteMissionWithPlans",
  async (missionId, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting mission with plans, ID:', missionId);
      const response = await missionApi.deleteMissionWithPlansAPI(missionId);
      console.log('✅ Mission with plans deleted:', response);
      return { missionId, ...response };
    } catch (err) {
      console.error('❌ Error deleting mission with plans:', err);
      return rejectWithValue(err);
    }
  },
);

export const deleteMissionPlanFromMission = createAsyncThunk(
  "missions/deleteMissionPlanFromMission",
  async ({ missionId, missionPlanId }, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting mission plan from mission:', { missionId, missionPlanId });
      const response = await missionApi.deleteMissionPlanFromMissionAPI(missionId, missionPlanId);
      console.log('✅ Mission plan deleted from mission:', response);
      return { missionId, missionPlanId, ...response };
    } catch (err) {
      console.error('❌ Error deleting mission plan from mission:', err);
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
        state.loading = false;
        const missionsList = action.payload.data || action.payload || [];
        state.list = missionsList;
        state.pagination = action.payload.pagination || state.pagination;
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
        console.log('📝 Mission plan creation fulfilled - payload:', action.payload);
        // Refresh current mission to include new mission plan
        if (state.currentMission && state.currentMission.missionPlans) {
          state.currentMission.missionPlans.push(action.payload);
        }
      })
      .addCase(addFlightPlanToMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Thêm flight plan vào mission thất bại";
        console.error('❌ Add flight plan to mission rejected:', action.payload);
        console.error('❌ Full error details:', {
          message: action.payload?.message,
          status: action.payload?.response?.status,
          data: action.payload?.response?.data,
          error: action.payload
        });
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
        console.log('✅ Start mission fulfilled - payload:', action.payload);
        
        // Update mission status to ACTIVE when started
        if (action.payload.mission) {
          // Update in missions list
          const index = state.list.findIndex(m => m._id === action.payload.mission._id);
          if (index !== -1) {
            state.list[index] = action.payload.mission;
            console.log('✅ Updated mission in list:', action.payload.mission);
          }
          
          // Update current mission if it's the same
          if (state.currentMission && state.currentMission.mission?._id === action.payload.mission._id) {
            state.currentMission.mission = action.payload.mission;
            console.log('✅ Updated current mission:', action.payload.mission);
          }
        }
      })
      .addCase(startMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Bắt đầu mission thất bại";
        console.error('❌ Start mission rejected:', action.payload);
      })

      // Delete mission with plans
      .addCase(deleteMissionWithPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMissionWithPlans.fulfilled, (state, action) => {
        state.loading = false;
        // Remove mission from list
        state.list = state.list.filter(m => m._id !== action.payload.missionId);
        // Clear current mission if it was the deleted one
        if (state.currentMission?.mission?._id === action.payload.missionId) {
          state.currentMission = null;
        }
        console.log('✅ Mission with plans removed from state');
      })
      .addCase(deleteMissionWithPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xóa mission thất bại";
        console.error('❌ Delete mission with plans rejected:', action.payload);
      })

      // Delete mission plan from mission
      .addCase(deleteMissionPlanFromMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMissionPlanFromMission.fulfilled, (state, action) => {
        state.loading = false;
        // Remove mission plan from current mission's mission plans
        if (state.currentMission?.missionPlans) {
          state.currentMission.missionPlans = state.currentMission.missionPlans.filter(
            plan => plan._id !== action.payload.missionPlanId
          );
        }
        console.log('✅ Mission plan removed from current mission');
      })
      .addCase(deleteMissionPlanFromMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xóa mission plan thất bại";
        console.error('❌ Delete mission plan from mission rejected:', action.payload);
      });
  },
});

export const { clearCurrentMission } = missionSlice.actions;

export const selectMissionsList = (state) => state.missions.list;
export const selectCurrentMission = (state) => state.missions.currentMission;
export const selectMissionsLoading = (state) => state.missions.loading;
export const selectMissionsError = (state) => state.missions.error;

export default missionSlice.reducer;
