import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookingInfo: {
    service_provider: "",
    service: "",
    scheduled_time: "",
    customer_notes: "",
    address: "",
    city: "",
    state: "",
    country: "Pakistan",
    location: {
      longitude: null,
      latitude: null,
    },
  },
  serviceInfo: {
    name: "",
    icon: "",
    pricing: {},
  },
  providerInfo: {},
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingInfo: (state, action) => {
      state.bookingInfo = action.payload;
    },
    setServiceInfo: (state, action) => {
      state.serviceInfo = action.payload;
    },
    setProviderInfo: (state, action) => {
      state.providerInfo = action.payload;
    },
    clearBookingState: () => initialState,
  },
});

export const {
  setBookingInfo,
  setProviderInfo,
  setServiceInfo,
  clearBookingInfo,
} = bookingSlice.actions;
export default bookingSlice.reducer;
