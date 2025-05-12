// store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, role, token } = action.payload;
      state.user = action.payload;
      state.role = action.payload;
      state.token = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
    },
    setUserFromStorage: (state, action) => {
      const { user, role, token } = action.payload;
      state.user = user;
      state.role = role;
      state.token = token;
    },
  },
});

export const { setCredentials, logoutUser, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
