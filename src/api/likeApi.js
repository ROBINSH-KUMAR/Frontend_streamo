import api from "./axios";

// ========================================
// LIKE / UNLIKE VIDEO
// ========================================
// This is a toggle endpoint.
//
// If the video is NOT liked:
//     POST /videos/:videoId/like
//     → likes the video
//
// If the video IS already liked:
//     POST /videos/:videoId/like
//     → unlikes the video
//
// Backend returns:
// {
//   likes: number,
//   isLiked: boolean
// }

export const likeVideo = async (videoId) => {
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  const response = await api.post(
    `/videos/${videoId}/like`
  );

  return response.data;
};