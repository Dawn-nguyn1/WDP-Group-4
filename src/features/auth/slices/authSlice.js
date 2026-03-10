import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, logoutAPI } from "../services/authApi";
import {
  getMyProfileAPI,
  updateMyProfileAPI,
  deleteMyAccountAPI,
} from "../../users/services/userApi";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      // Save token to localStorage
      if (res.token) {
        localStorage.setItem("access_token", res.token);
      }
      return res;
    } catch (error) {
      return rejectWithValue(error?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ fullName, email, password, role }, { rejectWithValue }) => {
    try {
      const res = await registerAPI(fullName, email, password, role);
      if (res.token) {
        localStorage.setItem("access_token", res.token);
      }
      return res;
    } catch (error) {
      return rejectWithValue(error?.message || "Register failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await logoutAPI();
      localStorage.removeItem("access_token");
      return res;
    } catch (error) {
      // Even if API fails, still clear local state
      localStorage.removeItem("access_token");
      return rejectWithValue(error?.message || "Logout failed");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyProfileAPI();
      return res;
    } catch (error) {
      return rejectWithValue(error?.message || "Fetch user failed");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await updateMyProfileAPI(data);
      return res;
    } catch (error) {
      return rejectWithValue(error?.message || "Update profile failed");
    }
  },
);

export const deleteMyAccount = createAsyncThunk(
  "auth/deleteMyAccount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await deleteMyAccountAPI();
      localStorage.removeItem("access_token");
      return res;
    } catch (error) {
      return rejectWithValue(error?.message || "Delete account failed");
    }
  },
);

const initialState = {
  user: null,
  token: localStorage.getItem("access_token") || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("access_token"),
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear state even if API fails
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // API response might be nested in user or data, or just be the object
        state.user =
          action.payload?.user || action.payload?.data || action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // If can't fetch user, token is likely invalid
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("access_token");
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // API response might be nested (e.g., { user: {...} } or just the user object)
        state.user =
          action.payload?.user || action.payload?.data || action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete Account
    builder
      .addCase(deleteMyAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMyAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteMyAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
