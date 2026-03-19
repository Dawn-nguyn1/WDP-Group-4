import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as flightPlanApi from "../services/flightPlanApi";

export const fetchFlightPlans = createAsyncThunk(
  "flightPlans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log(' [fetchFlightPlans] Calling API with params:', params);
      // API expects: page, limit, status (optional)
      const apiParams = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      if (params.status) {
        apiParams.status = params.status;
      }
      const response = await flightPlanApi.fetchFlightPlansAPI(apiParams);
      console.log(' [fetchFlightPlans] API response:', response);
      console.log(' [fetchFlightPlans] Response data:', response?.data);
      console.log(' [fetchFlightPlans] Response structure:', JSON.stringify(response, null, 2));
      return response;
    } catch (err) {
      console.error(' [fetchFlightPlans] API error:', err);
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
      return await flightPlanApi.createFlightPlanAPI(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const updateFlightPlan = createAsyncThunk(
  "flightPlans/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await flightPlanApi.updateFlightPlanAPI(id, data);
    } catch (err) {
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
        console.log('✅ [fetchFlightPlans] Fulfilled - Action payload:', action.payload);
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
        console.log('📋 [fetchFlightPlans] Updated flight plans list:', state.list);
        console.log('📄 [fetchFlightPlans] Updated pagination:', state.pagination);
        console.log('📏 [fetchFlightPlans] List length:', state.list.length);
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
      });
  },
});

export const { clearCurrentPlan } = flightPlanSlice.actions;

export const selectFlightPlansList = (state) => state.flightPlans.list;
export const selectCurrentFlightPlan = (state) => state.flightPlans.currentPlan;
export const selectFlightPlansLoading = (state) => state.flightPlans.loading;

export default flightPlanSlice.reducer;
