import { configureStore } from "@reduxjs/toolkit";
// import servicesReducer from "./slices/servicesSlice";
// import bookingReducer from "./slices/bookingSlice";

const store = configureStore({
  reducer: {
    // services: servicesReducer,
    // booking: bookingReducer,
  },
});

export default store;
