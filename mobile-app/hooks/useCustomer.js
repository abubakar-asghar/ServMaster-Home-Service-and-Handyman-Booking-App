import { useMutation } from "@tanstack/react-query";
import { registerCustomer } from "../api/services/customerApi";
import { Alert } from "react-native";

export const useRegisterCustomer = () => {
  return useMutation({
    mutationFn: registerCustomer,
    mutationKey: ["register-customer"],
    onSuccess: (data) => {
      Alert.alert("Succuess", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};
