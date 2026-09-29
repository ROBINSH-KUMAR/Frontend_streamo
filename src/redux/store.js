
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import videoReducer from "./slices/videoSlice";
import historyReducer from "./slices/historySlice";
import subscriptionReducer from "./slices/subscriptionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videoReducer,
    history: historyReducer,
    subscription: subscriptionReducer,
  },
});
