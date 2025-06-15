import { useMutation } from "@tanstack/react-query";
import {
  registerProvider,
  getProvidersByService,
  updateProviderPersonalInfo,
  updateProviderPassword,
  updateProviderBusinessInfo,
  verifyProviderProfessionalInfo,
  verifyProviderIdentity,
  verifyProviderPhone,
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

export const useUpdateProviderPersonalInfo = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => updateProviderPersonalInfo(data),
    mutationKey: ["update-provider-personal-info"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      await saveUserToStorage({token, role, user: userData});

      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};

export const useUpdateProviderBusinessInfo = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => updateProviderBusinessInfo(data),
    mutationKey: ["update-provider-business-info"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      await saveUserToStorage({token, role, user: userData});

      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};

export const useUpdateProviderPassword = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => updateProviderPassword(data),
    mutationKey: ["update-provider-password"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      await saveUserToStorage({token, role, user: userData});

      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};

export const useVerifyProviderPhone = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => verifyProviderPhone(data),
    mutationKey: ["verify-provider-phone"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      await saveUserToStorage({token, role, user: userData});

      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};

export const useVerifyProviderIdentity = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => verifyProviderIdentity(data),
    mutationKey: ["verify-provider-identity"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      await saveUserToStorage({token, role, user: userData});

      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
    },
  });
};

export const useVerifyProviderProfessionalInfo = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data) => verifyProviderProfessionalInfo(data),
    mutationKey: ["verify-provider-professional-info"],
    onSuccess: async (data) => {
      const userData = data?.data;
      dispatch(setUpdatedUser(userData));
      await saveUserToStorage({token, role, user: userData});

      Alert.alert("Success", data?.message);
    },
    onError: (error) => {
      Alert.alert("Error", error?.message);
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
//       Alert.alert("Error", error?.message);
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
//       Alert.alert("Error", error?.message);
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
//       Alert.alert("Error", error?.message);
//     },
//   });
// }
