import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
};

const customerBookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // ✅ Set all customer bookings
    setCustomerBookings: (state, action) => {
      state.bookings = action.payload;
    },

    // ✅ Clear all bookings
    clearCustomerBookings: (state) => {
      state.bookings = [];
    },

    // ✅ Delete single booking by _id
    deleteCustomerBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking._id !== action.payload
      );
    },

    // ✅ Add a new booking
    addCustomerBooking: (state, action) => {
      state.bookings.unshift(action.payload); // add to top of the list
    },

    // ✅ Update a specific booking by _id
    updateCustomerBooking: (state, action) => {
      const updated = action.payload;
      const index = state.bookings.findIndex((b) => b._id === updated._id);
      if (index !== -1) {
        state.bookings[index] = updated;
      }
    },
  },
});

export const {
  setCustomerBookings,
  clearCustomerBookings,
  deleteCustomerBooking,
  addCustomerBooking,
  updateCustomerBooking,
} = customerBookingSlice.actions;

export default customerBookingSlice.reducer;
