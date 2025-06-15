import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
// import servicesReducer from "./slices/servicesSlice";
// import bookingReducer from "./slices/bookingSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    // services: servicesReducer,
    // booking: bookingReducer,
  },
});

export default store;
