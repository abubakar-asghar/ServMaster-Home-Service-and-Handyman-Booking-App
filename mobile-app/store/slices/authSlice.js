import { createSlice } from "@reduxjs/toolkit";
import { saveUserToStorage } from "../../utils/storage";

const initialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      saveUserToStorage({ user, token });
      console.log(user, token);
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
    },
    setUserFromStorage: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    setUpdatedUser: (state, action) => {
      state.user = action.payload;

      saveUserToStorage({ user: action.payload, token: state.token });
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
