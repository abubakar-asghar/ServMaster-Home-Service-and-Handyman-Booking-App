import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provider: "",
  service: "",
  selected_day: "",
  selected_time: "",
  address: "",
  customer_notes: "",
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingInfo: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearBookingInfo: () => initialState,
  },
});

export const { setBookingInfo, clearBookingInfo } = bookingSlice.actions;
export default bookingSlice.reducer;
