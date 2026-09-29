
import api from "./axios";

// ==========================
// REGISTER
// ==========================
export const registerUser = async (formData) => {
  const response = await api.post("/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ==========================
// LOGIN
// ==========================
export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);

  return response.data;
};

// ==========================
// LOGOUT
// ==========================
export const logoutUser = async () => {
  const response = await api.post("/logout");

  return response.data;
};

// ==========================
// REFRESH TOKEN
// ==========================
export const refreshAccessToken = async () => {
  const response = await api.post("/refresh-token");

  return response.data;
};

// ==========================
// CURRENT USER
// ==========================
export const getCurrentUser = async () => {
  const response = await api.get("/current-user");

  return response.data;
};


export const getUserChannel = async (username) => {
  const response = await api.get(`/channel/${username}`);
  return response.data;
};


// ==========================
// CHANGE PASSWORD
// ==========================
export const changePassword = async (passwordData) => {
  const response = await api.patch(
    "/change-password",
    passwordData
  );

  return response.data;
};

// ==========================
// UPDATE ACCOUNT
// ==========================
export const updateAccount = async (accountData) => {
  const response = await api.patch(
    "/update-account",
    accountData
  );

  return response.data;
};

// ==========================
// UPDATE AVATAR
// ==========================
export const updateAvatar = async (formData) => {
  const response = await api.patch(
    "/avatar",
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
// UPDATE COVER IMAGE
// ==========================
export const updateCoverImage = async (formData) => {
  const response = await api.patch(
    "/cover-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
