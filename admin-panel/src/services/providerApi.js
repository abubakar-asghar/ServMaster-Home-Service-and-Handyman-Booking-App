import axiosInstance from "../api/axiosInstance";

export const getAllServiceProviders = async () => {
  const response = await axiosInstance.get("/api/admin/service-providers");
  return response.data;
};

export const getServiceProviderDetail = async (providerId) => {
  const response = await axiosInstance.get(
    `/api/admin/service-provider/${providerId}`
  );
  return response.data;
};

export const updateVerificationStatus = async (providerId) => {
  const response = await axiosInstance.put(
    `/api/admin/service-provider/${providerId}`
  );
  return response.data;
};

export const updateProviderVerification = async ({
  providerId,
  updateType,
  accountStatus,
  isPhoneVerified,
  identityStatus,
  professionalStatus,
  rejectionReason,
}) => {
  console.log(updateType);
  const response = await axiosInstance.put(
    `/api/admin/service-provider/${providerId}`,
    {
      updateType,
      ...(updateType === "account" && { accountStatus }),
      ...(updateType === "phone" && { isPhoneVerified }),
      ...(updateType === "identity" && { identityStatus }),
      ...(updateType === "professional" && { professionalStatus }),
      ...(rejectionReason && { rejectionReason }),
    }
  );
  return response.data;
};
