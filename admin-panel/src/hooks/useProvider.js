import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllServiceProviders,
  getServiceProviderDetail,
  updateProviderVerification,
} from "../services/providerApi";
import { useState } from "react";

export const useGetAllServiceProviders = () => {
  return useQuery({
    queryKey: ["all-service-providers"],
    queryFn: getAllServiceProviders,
  });
};

export const useGetServiceProviderDetail = (providerId) => {
  return useQuery({
    queryKey: ["service-provider-detail" + providerId],
    queryFn: () => getServiceProviderDetail(providerId),
    enabled: !!providerId,
  });
};

export const useUpdateVerificationStatus = () => {
  const [activeType, setActiveType] = useState(null);

  const mutation = useMutation({
    mutationFn: async (data) => {
      setActiveType(data.updateType);
      try {
        return await updateProviderVerification(data);
      } finally {
        setActiveType(null);
      }
    },
  });

  return {
    ...mutation,
    isUpdating: (type) => mutation.isLoading && activeType === type,
  };
};
