import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  toggleSubscriptionByVideo,
  toggleSubscriptionByChannel,
  getMySubscribers,
  getMySubscriptions,
  getChannelSubscribers,
  getChannelSubscriptions,
} from "../../api/subscriptionApi";


// ==========================================
// TOGGLE FROM VIDEO
// ==========================================

export const toggleVideoSubscription = createAsyncThunk(
  "subscription/toggleVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await toggleSubscriptionByVideo(videoId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Subscription failed"
      );
    }
  }
);


// ==========================================
// TOGGLE FROM CHANNEL
// ==========================================

export const toggleChannelSubscription = createAsyncThunk(
  "subscription/toggleChannel",
  async (ownerId, { rejectWithValue }) => {
    try {
      const response = await toggleSubscriptionByChannel(ownerId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Subscription failed"
      );
    }
  }
);


// ==========================================
// MY SUBSCRIBERS
// ==========================================

export const fetchMySubscribers = createAsyncThunk(
  "subscription/getMySubscribers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMySubscribers();

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch subscribers"
      );
    }
  }
);


// ==========================================
// MY SUBSCRIPTIONS
// ==========================================

export const fetchMySubscriptions = createAsyncThunk(
  "subscription/getMySubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMySubscriptions();

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch subscriptions"
      );
    }
  }
);


// ==========================================
// CHANNEL SUBSCRIBERS
// ==========================================

export const fetchChannelSubscribers = createAsyncThunk(
  "subscription/getChannelSubscribers",
  async (ownerId, { rejectWithValue }) => {
    try {
      const response = await getChannelSubscribers(ownerId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch channel subscribers"
      );
    }
  }
);


// ==========================================
// CHANNEL SUBSCRIPTIONS
// ==========================================

export const fetchChannelSubscriptions = createAsyncThunk(
  "subscription/getChannelSubscriptions",
  async (ownerId, { rejectWithValue }) => {
    try {
      const response = await getChannelSubscriptions(ownerId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch channel subscriptions"
      );
    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  subscribed: false,

  mySubscribers: [],
  mySubscriptions: [],

  channelSubscribers: [],
  channelSubscriptions: [],

  loading: false,
  error: null,
};


// ==========================================
// SLICE
// ==========================================

const subscriptionSlice = createSlice({
  name: "subscription",

  initialState,

  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },

    resetSubscriptionState: (state) => {
      state.subscribed = false;
      state.mySubscribers = [];
      state.mySubscriptions = [];
      state.channelSubscribers = [];
      state.channelSubscriptions = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {

    // ========================================
    // TOGGLE VIDEO SUBSCRIPTION
    // ========================================

    builder
      .addCase(toggleVideoSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(toggleVideoSubscription.fulfilled, (state, action) => {
        state.loading = false;

        state.subscribed =
          action.payload.data?.subscribed ?? false;
      })

      .addCase(toggleVideoSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // ========================================
    // TOGGLE CHANNEL SUBSCRIPTION
    // ========================================

    builder
      .addCase(toggleChannelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(toggleChannelSubscription.fulfilled, (state, action) => {
        state.loading = false;

        state.subscribed =
          action.payload.data?.subscribed ?? false;
      })

      .addCase(toggleChannelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // ========================================
    // MY SUBSCRIBERS
    // ========================================

    builder
      .addCase(fetchMySubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMySubscribers.fulfilled, (state, action) => {
        state.loading = false;

        state.mySubscribers =
          action.payload.data?.subscribers || [];
      })

      .addCase(fetchMySubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // ========================================
    // MY SUBSCRIPTIONS
    // ========================================

    builder
      .addCase(fetchMySubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.loading = false;

        state.mySubscriptions =
          action.payload.data?.subscriptions || [];
      })

      .addCase(fetchMySubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // ========================================
    // CHANNEL SUBSCRIBERS
    // ========================================

    builder
      .addCase(fetchChannelSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchChannelSubscribers.fulfilled, (state, action) => {
        state.loading = false;

        state.channelSubscribers =
          action.payload.data?.subscribers || [];
      })

      .addCase(fetchChannelSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // ========================================
    // CHANNEL SUBSCRIPTIONS
    // ========================================

    builder
      .addCase(fetchChannelSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchChannelSubscriptions.fulfilled, (state, action) => {
        state.loading = false;

        state.channelSubscriptions =
          action.payload.data?.subscriptions || [];
      })

      .addCase(fetchChannelSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});


export const {
  clearSubscriptionError,
  resetSubscriptionState,
} = subscriptionSlice.actions;


export default subscriptionSlice.reducer;