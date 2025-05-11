import axiosInstance from "../axiosInstance";

export const registerProvider = async (data) => {
  const response = await axiosInstance.post(
    "/api/service-providers/register",
    data
  );
  return response.data;
};

export const getProvidersByService = async (serviceId) => {
  const response = await axiosInstance.get(
    `/api/service-providers/${serviceId}`
  );
  return response.data;
};

export const updateProviderPersonalInfo = async (data) => {
  const response = await axiosInstance.put(
    "/api/service-providers/personal-info",
    data
  );
  return response.data;
};

export const updateProviderBusinessInfo = async (data) => {
  const response = await axiosInstance.put(
    "/api/service-providers/business-info",
    data
  );
  return response.data;
};

export const updateProviderPassword = async (data) => {
  const response = await axiosInstance.put(
    "/api/service-providers/change-password",
    data
  );
  return response.data;
};

export const verifyProviderPhone = async (data) => {
  const response = await axiosInstance.put(
    "/api/service-providers/phone-verification",
    data
  );
  return response.data;
};

export const verifyProviderIdentity = async (data) => {
  const response = await axiosInstance.put(
    "/api/service-providers/identity-verification",
    data
  );
  return response.data;
};

export const verifyProviderProfessionalInfo = async (data) => {
  const response = await axiosInstance.put(
    "/api/service-providers/professional-verification",
    data
  );
  return response.data;
};
