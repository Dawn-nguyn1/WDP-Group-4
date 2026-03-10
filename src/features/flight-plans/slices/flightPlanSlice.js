import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as flightPlanApi from "../services/flightPlanApi";

export const fetchFlightPlans = createAsyncThunk(
  "flightPlans/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await flightPlanApi.fetchFlightPlansAPI(params);
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

export const submitFlightPlan = createAsyncThunk(
  "flightPlans/submit",
  async (id, { rejectWithValue }) => {
    try {
      return await flightPlanApi.submitFlightPlanAPI(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const cancelFlightPlan = createAsyncThunk(
  "flightPlans/cancel",
  async (id, { rejectWithValue }) => {
    try {
      return await flightPlanApi.cancelFlightPlanAPI(id);
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
  conflicts: [], // Chứa xung đột trả về khi submit rejected hoặc xem detail
  loading: false,
  error: null,
};

const flightPlanSlice = createSlice({
  name: "flightPlans",
  initialState,
  reducers: {
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
      state.conflicts = [];
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
        // Tùy theo response BE, có thể là action.payload.data hoặc action.payload
        state.list = action.payload.data || action.payload || [];
        state.pagination = action.payload.pagination || state.pagination;
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
        state.conflicts = action.payload.conflicts || [];
      })
      .addCase(getFlightPlanDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải chi tiết";
      })

      // Submit plan
      .addCase(submitFlightPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFlightPlan.fulfilled, (state, action) => {
        // Phản hồi có thể là approved = true / false theo doc
        state.loading = false;
        if (
          state.currentPlan &&
          state.currentPlan._id === action.payload.flightPlan?._id
        ) {
          state.currentPlan = action.payload.flightPlan;
        }
        state.conflicts = action.payload.conflicts || [];
      })
      .addCase(submitFlightPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Submit thất bại";
        // TH Backend trả lỗi conflict status 400 kèm conflicts list array
        if (action.payload?.conflicts) {
          state.conflicts = action.payload.conflicts;
        }
        if (action.payload?.flightPlan && state.currentPlan) {
          state.currentPlan = action.payload.flightPlan;
        }
      });
  },
});

export const { clearCurrentPlan } = flightPlanSlice.actions;

export const selectFlightPlansList = (state) => state.flightPlans.list;
export const selectCurrentFlightPlan = (state) => state.flightPlans.currentPlan;
export const selectFlightPlanConflicts = (state) => state.flightPlans.conflicts;
export const selectFlightPlansLoading = (state) => state.flightPlans.loading;

export default flightPlanSlice.reducer;
