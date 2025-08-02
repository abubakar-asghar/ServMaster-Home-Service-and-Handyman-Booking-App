import { configureStore } from "@reduxjs/toolkit";
import customerBookingsReducer from "./slices/customerBookingsSlice";
import providerBookingsReducer from "./slices/providerBookingsSlice";
import servicesReducer from "./slices/servicesSlice";
import bookingReducer from "./slices/bookingSlice";
import authReducer from "./slices/authSlice";
import locationReducer from "./slices/locationSlice";
import selectablesReducer from "./slices/selectablesSlice";

const store = configureStore({
  reducer: {
    customerBookings: customerBookingsReducer,
    providerBookings: providerBookingsReducer,
    services: servicesReducer,
    booking: bookingReducer,
    auth: authReducer,
    location: locationReducer,
    selectables: selectablesReducer,
  },
});

export default store;
