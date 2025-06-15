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
      state.user = user;
      state.role = role;
      state.token = token;
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
    setUpdatedUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const {
  setCredentials,
  logoutUser,
  setUserFromStorage,
  setUpdatedUser,
} = authSlice.actions;
export default authSlice.reducer;
