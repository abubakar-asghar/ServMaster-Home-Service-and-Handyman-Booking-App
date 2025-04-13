import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  services: {
    acRepair: "AC Repair",
    applianceRepair: "Appliance Repair",
    cleaning: "Cleaning",
    countertop: "Countertop",
    doorsWindows: "Doors/Windows",
    garage: "Garage",
    gardening: "Gardening",
    lawnCare: "Lawn Care",
    painting: "Painting",
    plumbing: "Plumbing",
    renovation: "Renovation",
    roof: "Roof",
    snowRemoval: "Snow Removal",
  },
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.services = action.payload;
    },
  },
});

export const { setServices } = servicesSlice.actions;
export default servicesSlice.reducer;
