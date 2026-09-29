export const likeVideo = createAsyncThunk(
  "videos/likeVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      if (!videoId) {
        return rejectWithValue(
          "Video ID is required"
        );
      }

      const response =
        await likeVideoApi(videoId);

      return {
        videoId,
        data: response,
      };
    } catch (error) {
      console.error(
        "Like/Unlike API Error:",
        error.response?.data || error
      );

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to like/unlike video"
      );
    }
  }
);