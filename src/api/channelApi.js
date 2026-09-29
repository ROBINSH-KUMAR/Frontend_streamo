
import api from "./axios";

export const getUserChannelProfile = async (ownerId) => {
  const response = await api.get(
    `/channel/${ownerId}`
  );

  return response.data;
};