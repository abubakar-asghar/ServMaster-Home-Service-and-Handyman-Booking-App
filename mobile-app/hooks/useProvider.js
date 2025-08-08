import { useMutation, useQuery } from "@tanstack/react-query";
import {
  registerProvider,
  getProvidersByService,
  updateProviderPersonalInfo,
  updateProviderPassword,
  updateProviderBusinessInfo,
  verifyProviderProfessionalInfo,
  verifyProviderIdentity,
  verifyProviderPhone,
  getAllProviders,
  getProviderProfileForCustomer,
  addServices,
  deleteService,
  updateSerivce,
  getServiceDetails,
} from "../api/services/providerApi";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUpdatedUser } from "../store/slices/authSlice";
import { saveUserToStorage } from "../utils/storage";

export const useRegisterProvider = () => {
  return useMutation({
    mutationFn: registerProvider,
    mutationKey: ["register-provider"],
    onSuccess: (data) => {
      Alert.alert("Succuess", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useGetAllProviders = () => {
  return useQuery({
    queryKey: ["all-providers"],
    queryFn: () => getAllProviders(),
  });
};

export const useGetProviderProfileForCustomer = (providerId) => {
  return useQuery({
    queryKey: ["provider-profile-for-customer", providerId],
    queryFn: () => getProviderProfileForCustomer(providerId),
    enabled: !!providerId,
  });
};

export const useGetProvidersByService = (serviceId, location) => {
  return useQuery({
    queryKey: ["provider-by-service", serviceId, location],
    queryFn: () => getProvidersByService(serviceId, location),
    enabled: !!serviceId,
  });
};

export const useUpdateProviderPersonalInfo = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => updateProviderPersonalInfo(data),
    mutationKey: ["update-provider-personal-info"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useUpdateProviderBusinessInfo = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (formData) => updateProviderBusinessInfo(formData),
    mutationKey: ["update-provider-business-info"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useUpdateProviderPassword = () => {
  return useMutation({
    mutationFn: (data) => updateProviderPassword(data),
    mutationKey: ["update-provider-password"],
    onSuccess: async (data) => {
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useVerifyProviderPhone = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => verifyProviderPhone(data),
    mutationKey: ["verify-provider-phone"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useVerifyProviderIdentity = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => verifyProviderIdentity(data),
    mutationKey: ["verify-provider-identity"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useVerifyProviderProfessionalInfo = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => verifyProviderProfessionalInfo(data),
    mutationKey: ["verify-provider-professional-info"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useAddServices = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (data) => addServices(data),
    mutationKey: ["add-service"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useGetServiceDetails = () => {
  return useMutation({
    mutationFn: getServiceDetails,
    mutationKey: (variables) => [
      "service-detail-n-reviews",
      variables.serviceId,
    ],
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Error while fetching service details."
      );
    },
  });
};

export const useDeleteService = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (serviceId) => deleteService(serviceId),
    mutationKey: ["delete-service"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

export const useUpdateService = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (data) => updateSerivce(data), // Assuming addServices can also handle updates
    mutationKey: ["update-service"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      saveUserToStorage({ user: userData, token });
      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    },
  });
};

// export const useUploadProviderWorkImages = () => {
//   return useMutation({
//     mutationFn: (data) => uploadWorkImages(data),
//     mutationKey: ["upload-provider-work-images"],
//     onSuccess: (data) => {
//       Alert.alert("Success", data?.message);
//     },
//     onError: (error) => {
//       Alert.alert(
//   "Error",
//   error?.response?.data?.message || "Something went wrong"
// );
//     },
//   });
// };

// export const useUploadProviderCNICImages = () => {
//   return useMutation({
//     mutationFn: (data) => uploadWorkImages(data),
//     mutationKey: ["upload-provider-cnic-images"],
//     onSuccess: (data) => {
//       Alert.alert("Success", data?.message);
//     },
//     onError: (error) => {
//       Alert.alert(
//   "Error",
//   error?.response?.data?.message || "Something went wrong"
// );
//     },
//   });
// };

// export const useUploadProviderSelfie = () => {
//   return useMutation({
//     mutationFn: (data) => uploadWorkImages(data),
//     mutationKey: ["upload-provider-selfie"],
//     onSuccess: (data) => {
//       Alert.alert("Success", data?.message);
//     },
//     onError: (error) => {
//       Alert.alert(
//   "Error",
//   error?.response?.data?.message || "Something went wrong"
// );
//     },
//   });
// }
