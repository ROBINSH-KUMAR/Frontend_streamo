import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getWatchHistory as getWatchHistoryApi,
  addToWatchHistory as addToWatchHistoryApi,
  removeFromWatchHistory as removeFromWatchHistoryApi,
  clearWatchHistory as clearWatchHistoryApi,
} from "../../api/historyApi";

// ==========================================
// GET WATCH HISTORY
// ==========================================
export const fetchWatchHistory = createAsyncThunk(
  "history/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWatchHistoryApi();

      console.log("WATCH HISTORY RESPONSE:", response);

      return response;
    } catch (error) {
      console.error(
        "WATCH HISTORY ERROR:",
        error.response?.data || error,
      );

      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load watch history",
      );
    }
  },
);

// ==========================================
// ADD TO WATCH HISTORY
// ==========================================
export const addToWatchHistory = createAsyncThunk(
  "history/add",
  async (videoId, { rejectWithValue }) => {
    try {
      const response =
        await addToWatchHistoryApi(videoId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to add history",
      );
    }
  },
);

// ==========================================
// REMOVE FROM WATCH HISTORY
// ==========================================
export const removeFromWatchHistory = createAsyncThunk(
  "history/remove",
  async (videoId, { rejectWithValue }) => {
    try {
      const response =
        await removeFromWatchHistoryApi(videoId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to remove history",
      );
    }
  },
);

// ==========================================
// CLEAR WATCH HISTORY
// ==========================================
export const clearWatchHistory = createAsyncThunk(
  "history/clear",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await clearWatchHistoryApi();

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to clear history",
      );
    }
  },
);

// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
  history: [],
  loading: false,
  error: null,
};

// ==========================================
// SLICE
// ==========================================
const historySlice = createSlice({
  name: "history",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ====================================
      // FETCH PENDING
      // ====================================
      .addCase(
        fetchWatchHistory.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      // ====================================
      // FETCH SUCCESS
      // ====================================
      .addCase(
        fetchWatchHistory.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          /*
            Backend response:

            {
              statusCode: 200,
              data: {
                watchHistory: [...]
              }
            }

            Therefore:

            action.payload.data.watchHistory
          */

          state.history =
            action.payload?.data?.watchHistory || [];

          console.log(
            "HISTORY STORED IN REDUX:",
            state.history,
          );
        },
      )

      // ====================================
      // FETCH ERROR
      // ====================================
      .addCase(
        fetchWatchHistory.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Unable to load watch history";
        },
      )

      // ====================================
      // REMOVE SUCCESS
      // ====================================
      .addCase(
        removeFromWatchHistory.fulfilled,
        (state, action) => {
          const videoId = action.meta.arg;

          state.history = state.history.filter(
            (video) =>
              video._id?.toString() !==
              videoId?.toString(),
          );
        },
      )

      // ====================================
      // CLEAR SUCCESS
      // ====================================
      .addCase(
        clearWatchHistory.fulfilled,
        (state) => {
          state.history = [];
          state.error = null;
        },
      );
  },
});

export default historySlice.reducer;