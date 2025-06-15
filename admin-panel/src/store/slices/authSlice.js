import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, role, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
