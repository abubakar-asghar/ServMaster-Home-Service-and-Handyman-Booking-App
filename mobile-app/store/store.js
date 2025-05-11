import { configureStore } from "@reduxjs/toolkit";
import servicesReducer from "./slices/servicesSlice";
import bookingReducer from "./slices/bookingSlice";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    services: servicesReducer,
    booking: bookingReducer,
    auth: authReducer,
  },
});

export default store;
