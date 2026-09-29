
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  registerUser as registerUserApi,
  loginUser as loginUserApi,
  logoutUser as logoutUserApi,
  getCurrentUser as getCurrentUserApi,
  changePassword as changePasswordApi,
  updateAccount as updateAccountApi,
  updateAvatar as updateAvatarApi,
  updateCoverImage as updateCoverImageApi,
} from "../../api/authApi";

// ==========================
// REGISTER
// ==========================
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      return await registerUserApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  }
);

// ==========================
// LOGIN
// ==========================
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(credentials);

      const accessToken =
        response?.data?.accessToken ||
        response?.accessToken;

      if (accessToken) {
        localStorage.setItem(
          "accessToken",
          accessToken
        );
      }

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  }
);

// ==========================
// CURRENT USER
// ==========================
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentUserApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Unable to get current user"
      );
    }
  }
);

// ==========================
// LOGOUT
// ==========================
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutUserApi();

      localStorage.removeItem("accessToken");

      return response;
    } catch (error) {
      localStorage.removeItem("accessToken");

      return rejectWithValue(
        error.response?.data?.message ||
        "Logout failed"
      );
    }
  }
);

// ==========================
// CHANGE PASSWORD
// ==========================
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      return await changePasswordApi(passwordData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Password change failed"
      );
    }
  }
);

// ==========================
// UPDATE ACCOUNT
// ==========================
export const updateAccount = createAsyncThunk(
  "auth/updateAccount",
  async (accountData, { rejectWithValue }) => {
    try {
      return await updateAccountApi(accountData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Account update failed"
      );
    }
  }
);

// ==========================
// UPDATE AVATAR
// ==========================
export const updateAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      return await updateAvatarApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Avatar update failed"
      );
    }
  }
);

// ==========================
// UPDATE COVER
// ==========================
export const updateCoverImage = createAsyncThunk(
  "auth/updateCoverImage",
  async (formData, { rejectWithValue }) => {
    try {
      return await updateCoverImageApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Cover image update failed"
      );
    }
  }
);

// ==========================
// INITIAL STATE
// ==========================
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
  error: null,
};

// ==========================
// SLICE
// ==========================
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },

  extraReducers: (builder) => {
    // ==========================
    // REGISTER
    // ==========================
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ==========================
    // LOGIN
    // ==========================
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        const user =
          action.payload?.data?.user ||
          action.payload?.user;

        if (user) {
          state.user = user;
          state.isAuthenticated = true;
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // ==========================
    // CURRENT USER
    // ==========================
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;

        const user =
          action.payload?.data?.user ||
          action.payload?.user ||
          action.payload?.data;

        if (user) {
          state.user = user;
          state.isAuthenticated = true;
        }
      })

      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.isAuthenticated = false;
      });

    // ==========================
    // LOGOUT
    // ==========================
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });

    // ==========================
    // CHANGE PASSWORD
    // ==========================
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ==========================
    // UPDATE ACCOUNT
    // ==========================
    builder
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;

        const user =
          action.payload?.data?.user ||
          action.payload?.user;

        if (user) {
          state.user = user;
        }
      })

      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ==========================
    // AVATAR
    // ==========================
    builder
      .addCase(updateAvatar.fulfilled, (state, action) => {
        const user =
          action.payload?.data?.user ||
          action.payload?.user;

        if (user) {
          state.user = user;
        }
      });

    // ==========================
    // COVER
    // ==========================
    builder
      .addCase(updateCoverImage.fulfilled, (state, action) => {
        const user =
          action.payload?.data?.user ||
          action.payload?.user;

        if (user) {
          state.user = user;
        }
      });
  },
});

export const {
  clearAuthError,
  setUser,
  clearUser,
} = authSlice.actions;

export default authSlice.reducer;
