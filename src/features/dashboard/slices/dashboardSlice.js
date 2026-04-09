import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPaymentsAPI, fetchRevenueAPI, fetchDroneAnalyticsAPI } from "../services/dashboardAPI";

// Async thunks
export const fetchPayments = createAsyncThunk(
  "dashboard/fetchPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPaymentsAPI();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi tải danh sách thanh toán");
    }
  }
);

export const fetchRevenue = createAsyncThunk(
  "dashboard/fetchRevenue", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchRevenueAPI();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi tải thống kê doanh thu");
    }
  }
);

export const fetchDroneAnalytics = createAsyncThunk(
  "dashboard/fetchDroneAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDroneAnalyticsAPI();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi tải thống kê drone");
    }
  }
);

// Initial state
const initialState = {
  payments: [],
  revenue: {
    daily: [],
    monthly: [],
    quarterly: [],
    yearly: []
  },
  droneAnalytics: {
    totalDrones: 0,
    byOwnerType: {
      INDIVIDUAL: 0,
      FLEET: 0
    },
    drones: []
  },
  loading: false,
  error: null,
};

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.payments = [];
      state.revenue = { daily: [], monthly: [], quarterly: [], yearly: [] };
      state.droneAnalytics = {
        totalDrones: 0,
        byOwnerType: { INDIVIDUAL: 0, FLEET: 0 },
        drones: []
      };
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data || [];
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải danh sách thanh toán";
      });

    // Fetch revenue
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload.data || { daily: [], monthly: [], quarterly: [], yearly: [] };
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải thống kê doanh thu";
      });

    // Fetch drone analytics
    builder
      .addCase(fetchDroneAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDroneAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.droneAnalytics = action.payload.data || {
          totalDrones: 0,
          byOwnerType: { INDIVIDUAL: 0, FLEET: 0 },
          drones: []
        };
      })
      .addCase(fetchDroneAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải thống kê drone";
      });
  },
});

export const { clearError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
