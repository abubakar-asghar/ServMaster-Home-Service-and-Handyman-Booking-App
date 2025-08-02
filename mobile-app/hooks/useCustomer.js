import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavoriteProvider,
  addFavoriteService,
  checkFavoriteProvider,
  checkFavoriteService,
  getFavoriteProviders,
  getFavoriteServices,
  registerCustomer,
  removeFavoriteProvider,
  removeFavoriteService,
  updateCustomer,
} from "../api/services/customerApi";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, setUpdatedUser } from "../store/slices/authSlice";

export const useRegisterCustomer = () => {
  return useMutation({
    mutationFn: registerCustomer,
    mutationKey: ["register-customer"],
    onSuccess: (data) => {
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while registering"
      );
    },
  });
};

export const useUpdateCustomer = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({ data, customerId }) => updateCustomer(data, customerId),
    mutationKey: ["update-customer"],
    onSuccess: (data) => {
      dispatch(setUpdatedUser(data?.data));
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    },
  });
};

export const useAddFavoriteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId) => addFavoriteProvider(providerId),
    mutationKey: ["add-favorite-provider"],
    onSuccess: (data, providerId) => {
      queryClient.invalidateQueries(["get-favorite-providers"]);
      queryClient.setQueryData(["check-favorite-provider", providerId], true);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    },
  });
};

export const useRemoveFavoriteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId) => removeFavoriteProvider(providerId),
    mutationKey: ["remove-favorite-provider"],
    onSuccess: (data, providerId) => {
      queryClient.invalidateQueries(["get-favorite-providers"]);
      queryClient.setQueryData(["check-favorite-provider", providerId], true);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    },
  });
};

export const useGetFavoriteProviders = () => {
  return useQuery({
    queryFn: getFavoriteProviders,
    queryKey: ["get-favorite-providers"],
  });
};

export const useAddFavoriteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId) => addFavoriteService(serviceId),
    mutationKey: ["add-favorite-service"],
    onSuccess: (data, serviceId) => {
      queryClient.invalidateQueries(["get-favorite-services"]);
      queryClient.setQueryData(["check-favorite-service", serviceId], true);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    },
  });
};

export const useRemoveFavoriteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId) => removeFavoriteService(serviceId),
    mutationKey: ["remove-favorite-service"],
    onSuccess: (data, serviceId) => {
      queryClient.invalidateQueries(["get-favorite-services"]);
      queryClient.setQueryData(["check-favorite-service", serviceId], true);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    },
  });
};

export const useGetFavoriteServices = () => {
  return useQuery({
    queryFn: getFavoriteServices,
    queryKey: ["get-favorite-services"],
  });
};

export const useCheckFavoriteProvider = (providerId) => {
  return useQuery({
    queryFn: () => checkFavoriteProvider(providerId),
    queryKey: ["check-favorite-provider", providerId],
    enabled: !!providerId,
  });
};

export const useCheckFavoriteService = (serviceId) => {
  return useQuery({
    queryFn: () => checkFavoriteService(serviceId),
    queryKey: ["check-favorite-service", serviceId],
    enabled: !!serviceId,
  });
};
