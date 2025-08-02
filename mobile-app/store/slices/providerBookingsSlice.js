import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
};

const providerBookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // ✅ Set all provider bookings
    setProviderBookings: (state, action) => {
      state.bookings = action.payload;
    },

    // ✅ Clear all bookings
    clearProviderBookings: (state) => {
      state.bookings = [];
    },

    // ✅ Delete single booking by _id
    deleteProviderBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking._id !== action.payload
      );
    },

    // ✅ Add a new booking
    addProviderBooking: (state, action) => {
      state.bookings.unshift(action.payload); // add to top of the list
    },

    // ✅ Update a specific booking by _id
    updateProviderBooking: (state, action) => {
      const updated = action.payload;
      const index = state.bookings.findIndex((b) => b._id === updated._id);
      if (index !== -1) {
        state.bookings[index] = updated;
      }
    },
  },
});

export const {
  setProviderBookings,
  clearProviderBookings,
  deleteProviderBooking,
  addProviderBooking,
  updateProviderBooking,
} = providerBookingSlice.actions;

export default providerBookingSlice.reducer;
