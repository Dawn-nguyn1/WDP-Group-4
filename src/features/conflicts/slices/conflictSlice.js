import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as conflictApi from "../services/conflictApi";

export const fetchConflicts = createAsyncThunk(
  "conflicts/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await conflictApi.fetchConflictsAPI(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const getConflictDetail = createAsyncThunk(
  "conflicts/getDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await conflictApi.getConflictDetailAPI(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const resolveConflict = createAsyncThunk(
  "conflicts/resolve",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await conflictApi.resolveConflictAPI(id, payload);
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
  currentConflict: null,
  loading: false,
  error: null,
};

const conflictSlice = createSlice({
  name: "conflicts",
  initialState,
  reducers: {
    clearCurrentConflict: (state) => {
      state.currentConflict = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConflicts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConflicts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchConflicts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lấy danh sách thất bại";
      })

      .addCase(getConflictDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConflictDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConflict = action.payload.conflict || action.payload;
      })
      .addCase(getConflictDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi tải chi tiết xung đột";
      })

      .addCase(resolveConflict.pending, (state) => {
        state.loading = true;
      })
      .addCase(resolveConflict.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConflict = action.payload.conflict || action.payload;
      })
      .addCase(resolveConflict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Resolve thất bại";
      });
  },
});

export const { clearCurrentConflict } = conflictSlice.actions;

export const selectConflictsList = (state) => state.conflicts.list;
export const selectCurrentConflict = (state) => state.conflicts.currentConflict;
export const selectConflictsLoading = (state) => state.conflicts.loading;

export default conflictSlice.reducer;
