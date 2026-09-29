
import api from "./axios";

// ==========================
// GET WATCH HISTORY
// ==========================
export const getWatchHistory = async () => {
  const response = await api.get("/watch-history");

  return response.data;
};

// ==========================
// ADD TO WATCH HISTORY
// ==========================
export const addToWatchHistory = async (videoId) => {
  const response = await api.post(
    `/watch-history/${videoId}`
  );

  return response.data;
};

// ==========================
// REMOVE FROM WATCH HISTORY
// ==========================
export const removeFromWatchHistory = async (videoId) => {
  const response = await api.delete(
    `/watch-history/${videoId}`
  );

  return response.data;
};

// ==========================
// CLEAR WATCH HISTORY
// ==========================
export const clearWatchHistory = async () => {
  const response = await api.delete(
    "/watch-history"
  );

  return response.data;
};

