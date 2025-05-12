import { useMutation } from "@tanstack/react-query";
import {
  registerProvider,
  getProvidersByService,
} from "../api/services/providerApi";
import { Alert } from "react-native";

export const useRegisterProvider = () => {
  return useMutation({
    mutationFn: registerProvider,
    mutationKey: ["register-provider"],
    onSuccess: (data) => {
      Alert.alert("Succuess", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};

export const useGetProvidersByService = (serviceId) => {
  return useQuery({
    queryKey: ["provider-by-service", serviceId],
    queryFn: () => getProvidersByService(serviceId),
    enabled: !!serviceId,
  });
};
