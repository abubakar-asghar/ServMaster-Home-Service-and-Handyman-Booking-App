import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/services/authApi";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { saveUserToStorage } from "../utils/storage";
import { router } from "expo-router";

export const useLoginUser = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: loginUser,
    mutationKey: ["login-user"],
    onSuccess: async (response) => {
      const userData = {
        user: response?.data,
        token: response?.token,
        role: response?.role,
      };
      dispatch(setCredentials(userData));
      await saveUserToStorage(userData);

      if (userData.role === "service-provider") {
        router.replace("/provider/home");
      } else if (userData.role === "customer") {
        router.replace("/customer/home");
      } else {
        Alert.alert("Login Error", "Invalid user role.");
      }

      Alert.alert("User logged in successfully", response?.message);
    },
    onError: (error) => {
      Alert.alert("Error while logging in user", error?.message);
    },
  });
};
