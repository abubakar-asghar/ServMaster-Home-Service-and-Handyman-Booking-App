import { useMutation } from "@tanstack/react-query";
import {
  loginUser,
  resendVerificationCode,
  verifyUserPhone,
} from "../api/services/authApi";
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
    onSuccess: (response) => {
      console.log(response);
      const userData = {
        user: response.data,
        token: response.token,
      };
      const storageData = {
        role: response.data?.role,
        token: response.token,
      };

      // Save credentials synchronously
      dispatch(setCredentials(userData));
      saveUserToStorage(storageData).then(() => {
        console.log("Storage saved, now navigating...");

        // Add slight delay to ensure state is updated
        setTimeout(() => {
          if (response.data.role === "ServiceProvider") {
            console.log("Navigating to provider home");
            router.replace("/provider/home");
          } else {
            console.log("Navigating to customer home");
            router.replace("/customer/home");
          }
        }, 100);
      });
      Alert.alert("Success", response.message);
    },
    onError: (error) => {
      if (
        error.response?.status === 403 &&
        error.response.data.message.includes("Verification code sent")
      ) {
        // Extract phone number from the request
        const phone = JSON.parse(error.config.data).phone;

        // Redirect to OTP verification with phone number
        router.push({
          pathname: "/auth/verify-otp",
          params: {
            phone: phone,
            from: "login",
            message: error.response.data.message,
          },
        });
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Login failed. Please try again."
        );
      }
    },
  });
};

export const useVerifyUserPhone = () => {
  return useMutation({
    mutationFn: verifyUserPhone,
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: resendVerificationCode,
  });
};
