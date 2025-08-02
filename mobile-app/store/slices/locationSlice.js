// locationSlice.js - Updated version
import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
  name: "location",
  initialState: {
    selected: null,
  },
  reducers: {
    setSelectedLocation: (state, action) => {
      state.selected = {
        coordinates: {
          latitude:
            action.payload.coordinates?.latitude ||
            action.payload.points?.latitude,
          longitude:
            action.payload.coordinates?.longitude ||
            action.payload.points?.longitude,
        },
        address: action.payload.address || {
          city: action.payload.city,
          region: action.payload.state || action.payload.region,
          formattedAddress: action.payload.formattedAddress,
        },
        formattedAddress:
          action.payload.formattedAddress ||
          `${action.payload.city}, ${action.payload.state}`,
      };
    },
    clearSelectedLocation: (state) => {
      state.selected = null;
    },
  },
});

export const { setSelectedLocation, clearSelectedLocation } =
  locationSlice.actions;
export default locationSlice.reducer;
