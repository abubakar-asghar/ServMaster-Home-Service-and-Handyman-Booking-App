import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import modalReducer from "./slices/modalSlice";
// import servicesReducer from "./slices/servicesSlice";
// import bookingReducer from "./slices/bookingSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalReducer,
    // services: servicesReducer,
    // booking: bookingReducer,
  },
});

export default store;
