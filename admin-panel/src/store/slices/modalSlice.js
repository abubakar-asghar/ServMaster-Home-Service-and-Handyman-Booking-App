import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  type: null,
  data: null,
  isOpen: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModalState: (state, action) => {
      state.type = action.payload.type;
      state.data = action.payload.data;
      state.isOpen = action.payload.isOpen;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.data = null;
    },
  },
});

export const { setModalState, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
