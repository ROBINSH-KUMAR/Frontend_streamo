import api from "./axios";

// Subscribe / unsubscribe from video
export const toggleSubscriptionByVideo = async (videoId) => {
  const response = await api.post(
    `/toggle/video/${videoId}`
  );

  return response.data;
};

// Subscribe / unsubscribe from channel
export const toggleSubscriptionByChannel = async (ownerId) => {
  const response = await api.post(
    `/toggle/channel/${ownerId}`
  );

  return response.data;
};

// People subscribed to me
export const getMySubscribers = async () => {
  const response = await api.get(
    "/subscriptions/my-subscribers"
  );

  return response.data;
};

// Channels I subscribed to
export const getMySubscriptions = async () => {
  const response = await api.get(
    "/subscriptions/my-subscriptions"
  );

  return response.data;
};

// People subscribed to a particular channel
export const getChannelSubscribers = async (ownerId) => {
  const response = await api.get(
    `/channel/${ownerId}/subscribers`
  );

  return response.data;
};

// Channels that a particular channel subscribed to
export const getChannelSubscriptions = async (ownerId) => {
  const response = await api.get(
    `/channel/${ownerId}/subscriptions`
  );

  return response.data;
};