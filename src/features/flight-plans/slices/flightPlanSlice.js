import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as flightPlanApi from "../services/flightPlanApi";

export const fetchFlightPlans = createAsyncThunk(
  "flightPlans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // API expects: page, limit, status (optional)
      const apiParams = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      if (params.status) {
        apiParams.status = params.status;
      }
      const response = await flightPlanApi.fetchFlightPlansAPI(apiParams);
     
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const getFlightPlanDetail = createAsyncThunk(
  "flightPlans/getDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await flightPlanApi.getFlightPlanDetailAPI(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const createFlightPlan = createAsyncThunk(
  "flightPlans/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await flightPlanApi.createFlightPlanAPI(data);
      return response;
    } catch (err) {
      console.error('❌ [createFlightPlan] API error:', err);
      return rejectWithValue(err);
    }
  },
);

export const updateFlightPlan = createAsyncThunk(
  "flightPlans/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await flightPlanApi.updateFlightPlanAPI(id, data);
      return response;
    } catch (err) {
      console.error('❌ [updateFlightPlan] API error:', err);
      return rejectWithValue(err);
    }
  },
);

export const deleteFlightPlan = createAsyncThunk(
  "flightPlans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await flightPlanApi.deleteFlightPlanAPI(id);
      return id;
    } catch (err) {
      console.error('❌ [deleteFlightPlan] API error:', err);
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
  currentPlan: null,
  loading: false,
  error: null,
};

const flightPlanSlice = createSlice({
  name: "flightPlans",
  initialState,
  reducers: {
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchFlightPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlightPlans.fulfilled, (state, action) => {
        state.loading = false;
        // API mới trả về: data array và pagination object
        state.list = action.payload.data || [];
        state.pagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        };
      
      })
      .addCase(fetchFlightPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải dữ liệu flight plan";
      })

      // Get detail
      .addCase(getFlightPlanDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlightPlanDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload.flightPlan || action.payload;
      })
      .addCase(getFlightPlanDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải chi tiết";
      })

      // Create flight plan
      .addCase(createFlightPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFlightPlan.fulfilled, (state, action) => {
        state.loading = false;
        // Add new flight plan to list
        if (action.payload?.flightPlan || action.payload) {
          state.list.unshift(action.payload.flightPlan || action.payload);
        }
      })
      .addCase(createFlightPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tạo kế hoạch bay";
      })

      // Update flight plan
      .addCase(updateFlightPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFlightPlan.fulfilled, (state, action) => {
        state.loading = false;
        // Update flight plan in list
        if (action.payload?.flightPlan || action.payload) {
          const updatedPlan = action.payload.flightPlan || action.payload;
          const index = state.list.findIndex(plan => plan._id === updatedPlan._id);
          if (index !== -1) {
            state.list[index] = updatedPlan;
          }
          // Also update current plan if it's the same
          if (state.currentPlan?._id === updatedPlan._id) {
            state.currentPlan = updatedPlan;
          }
        }
      })
      .addCase(updateFlightPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi cập nhật kế hoạch bay";
      })

      // Delete flight plan
      .addCase(deleteFlightPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFlightPlan.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from list
        state.list = state.list.filter(plan => plan._id !== action.payload);
        // Clear current plan if it's the deleted one
        if (state.currentPlan?._id === action.payload) {
          state.currentPlan = null;
        }
      })
      .addCase(deleteFlightPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi xóa kế hoạch bay";
      });
  },
});

export const { clearCurrentPlan } = flightPlanSlice.actions;

export const selectFlightPlansList = (state) => state.flightPlans.list;
export const selectCurrentFlightPlan = (state) => state.flightPlans.currentPlan;
export const selectFlightPlansLoading = (state) => state.flightPlans.loading;

export default flightPlanSlice.reducer;
