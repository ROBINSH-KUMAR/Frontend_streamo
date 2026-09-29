import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAllVideos as getAllVideosApi,
  publishVideo as publishVideoApi,
  togglePublishStatus as togglePublishStatusApi,
  deleteVideo as deleteVideoApi,
  incrementVideoViews as incrementVideoViewsApi,
  likeVideo as likeVideoApi,
  unlikeVideo as unlikeVideoApi,
} from "../../api/videoApi";

// ==========================
// GET VIDEOS
// ==========================
export const fetchVideos = createAsyncThunk(
  "videos/fetchVideos",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllVideosApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load videos"
      );
    }
  }
);

// ==========================
// PUBLISH VIDEO
// ==========================
export const publishVideo = createAsyncThunk(
  "videos/publish",
  async (formData, { rejectWithValue }) => {
    try {
      return await publishVideoApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Video upload failed"
      );
    }
  }
);

// ==========================
// TOGGLE PUBLISH
// ==========================
export const togglePublishStatus = createAsyncThunk(
  "videos/togglePublish",
  async (videoId, { rejectWithValue }) => {
    try {
      return await togglePublishStatusApi(videoId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to change publish status"
      );
    }
  }
);

// ==========================
// DELETE VIDEO
// ==========================
export const deleteVideo = createAsyncThunk(
  "videos/deleteVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      if (!videoId) {
        return rejectWithValue("Video ID is required");
      }

      return await deleteVideoApi(videoId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to delete video"
      );
    }
  }
);

// ==========================
// INCREMENT VIDEO VIEW
// ==========================
export const incrementVideoView = createAsyncThunk(
  "videos/incrementVideoView",
  async (videoId, { rejectWithValue }) => {
    try {
      return await incrementVideoViewsApi(videoId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to update video views"
      );
    }
  }
);

// ==========================
// LIKE VIDEO
// ==========================
export const likeVideo = createAsyncThunk(
  "videos/likeVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      if (!videoId) {
        return rejectWithValue("Video ID is required");
      }

      return await likeVideoApi(videoId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to like video"
      );
    }
  }
);

// ==========================
// UNLIKE VIDEO
// ==========================
export const unlikeVideo = createAsyncThunk(
  "videos/unlikeVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      if (!videoId) {
        return rejectWithValue("Video ID is required");
      }

      return await unlikeVideoApi(videoId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to unlike video"
      );
    }
  }
);

// ==========================
// INITIAL STATE
// ==========================
const initialState = {
  videos: [],
  loading: false,
  uploading: false,
  error: null,
  hasMore: false,
};

// ==========================
// SLICE
// ==========================
const videoSlice = createSlice({
  name: "videos",

  initialState,

  reducers: {
    clearVideos: (state) => {
      state.videos = [];
    },
  },

  extraReducers: (builder) => {
    // ==========================
    // GET VIDEOS
    // ==========================
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data;

        state.videos = data?.videos || [];
        state.hasMore = data?.hasMore || false;
      })

      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load videos";
      });

    // ==========================
    // PUBLISH VIDEO
    // ==========================
    builder
      .addCase(publishVideo.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })

      .addCase(publishVideo.fulfilled, (state) => {
        state.uploading = false;
      })

      .addCase(publishVideo.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });

    // ==========================
    // TOGGLE PUBLISH STATUS
    // ==========================
    builder
      .addCase(
        togglePublishStatus.fulfilled,
        (state, action) => {
          const videoId = action.meta.arg;

          const video = state.videos.find(
            (item) => item._id === videoId
          );

          if (!video) {
            return;
          }

          const response = action.payload;
          const data = response?.data ?? response;

          /*
           * Use the actual value returned by the server
           * when available.
           */
          if (typeof data?.isPublished === "boolean") {
            video.isPublished = data.isPublished;
          } else {
            video.isPublished = !video.isPublished;
          }
        }
      )

      .addCase(
        togglePublishStatus.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Unable to change publish status";
        }
      );

    // ==========================
    // DELETE VIDEO
    // ==========================
    builder
      .addCase(
        deleteVideo.fulfilled,
        (state, action) => {
          const videoId = action.meta.arg;

          state.videos = state.videos.filter(
            (video) => video._id !== videoId
          );
        }
      )

      .addCase(
        deleteVideo.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Unable to delete video";
        }
      );

    // ==========================
    // INCREMENT VIDEO VIEW
    // ==========================
    builder.addCase(
      incrementVideoView.fulfilled,
      (state, action) => {
        const videoId = action.meta.arg;

        const video = state.videos.find(
          (item) => item._id === videoId
        );

        if (video) {
          video.views = (video.views || 0) + 1;
        }
      }
    );

    // ==========================
    // INCREMENT VIEW ERROR
    // ==========================
    builder.addCase(
      incrementVideoView.rejected,
      (state, action) => {
        state.error =
          action.payload || "Unable to update views";
      }
    );

    // ==========================
    // LIKE VIDEO
    // ==========================
    builder.addCase(
      likeVideo.fulfilled,
      (state, action) => {
        const videoId = action.meta.arg;

        const video = state.videos.find(
          (item) => item._id === videoId
        );

        if (!video) {
          return;
        }

        /*
         * API helper already returns response.data.
         *
         * Expected backend response:
         * {
         *   likes: Number,
         *   isLiked: Boolean
         * }
         *
         * Do NOT increment likes manually here.
         * Use the actual value returned by the server.
         */
        const response = action.payload;
        const data = response?.data ?? response;

        if (typeof data?.likes === "number") {
          video.likes = data.likes;
        }

        if (typeof data?.isLiked === "boolean") {
          video.isLiked = data.isLiked;
        } else {
          video.isLiked = true;
        }
      }
    );

    // ==========================
    // LIKE ERROR
    // ==========================
    builder.addCase(
      likeVideo.rejected,
      (state, action) => {
        state.error =
          action.payload || "Unable to like video";
      }
    );

    // ==========================
    // UNLIKE VIDEO
    // ==========================
    builder.addCase(
      unlikeVideo.fulfilled,
      (state, action) => {
        const videoId = action.meta.arg;

        const video = state.videos.find(
          (item) => item._id === videoId
        );

        if (!video) {
          return;
        }

        /*
         * Use the server response instead of manually
         * subtracting one.
         */
        const response = action.payload;
        const data = response?.data ?? response;

        if (typeof data?.likes === "number") {
          video.likes = data.likes;
        }

        if (typeof data?.isLiked === "boolean") {
          video.isLiked = data.isLiked;
        } else {
          video.isLiked = false;
        }
      }
    );

    // ==========================
    // UNLIKE ERROR
    // ==========================
    builder.addCase(
      unlikeVideo.rejected,
      (state, action) => {
        state.error =
          action.payload || "Unable to unlike video";
      }
    );
  },
});

export const { clearVideos } = videoSlice.actions;

export default videoSlice.reducer;
