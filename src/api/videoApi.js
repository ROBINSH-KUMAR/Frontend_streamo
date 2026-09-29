
import api from "./axios";


// LIKE VIDEO
export const likeVideo = async (videoId) => {
  const response = await api.post(
    `/videos/${videoId}/like`
  );

  return response.data;
};

// UNLIKE VIDEO
export const unlikeVideo = async (videoId) => {
  const response = await api.delete(
    `/videos/${videoId}/like`
  );

  return response.data;
};


// ==========================
// GET ALL VIDEOS
// ==========================
export const getAllVideos = async (params = {}) => {
  const response = await api.get("/videos", {
    params,
  });

  return response.data;
};

// ==========================
// PUBLISH VIDEO
// ==========================
export const publishVideo = async (formData) => {
  const response = await api.post(
    "/publish-video",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ==========================
// TOGGLE PUBLISH STATUS
// ==========================
export const togglePublishStatus = async (videoId) => {
  const response = await api.patch(
    `/videos/${videoId}/publish`
  );

  return response.data;
};

// ==========================
// INCREMENT VIDEO VIEWS
// ==========================
export const incrementVideoViews = async (videoId) => {
  const response = await api.patch(
    `/videos/${videoId}/view`
  );

  return response.data;
};



export const deleteVideo = async (videoId) => {
  const response = await api.delete(
    `/videos/${videoId}`
  );

  return response.data;
};