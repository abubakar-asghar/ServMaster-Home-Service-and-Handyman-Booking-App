import axiosInstance from "../axiosInstance";

export const registerCustomer = async (data) => {
  const response = await axiosInstance.post("/api/auth/register/customer", data);
  return response.data;
};

export const updateCustomer = async (data, customerId) => {
  const response = await axiosInstance.put(
    `/api/customers/${customerId}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // Add 30s timeout
    }
  );
  return response.data;
};

export const getCustomerById = async (customerId) => {
  const response = await axiosInstance.get(`/api/customers/${customerId}`);
  return response.data;
};

export const getProvidersBookedSlots = async (providerId) => {
  const response = await axiosInstance.get(
    `/api/service-providers/booked-time-slots/${providerId}`
  );
  return response.data;
};

export const addFavoriteProvider = async (providerId) => {
  const response = await axiosInstance.post(
    "/api/customers/favourite-providers/new",
    {
      providerId,
    }
  );
  return response.data;
};

export const removeFavoriteProvider = async (providerId) => {
  const response = await axiosInstance.delete(
    `/api/customers/favourite-providers/${providerId}`
  );
  return response.data;
};

export const getFavoriteProviders = async () => {
  const response = await axiosInstance.get(
    "/api/customers/favourite-providers"
  );
  return response.data;
};

export const addFavoriteService = async (serviceId) => {
  const response = await axiosInstance.post(
    "/api/customers/favourite-services/new",
    {
      serviceId,
    }
  );
  return response.data;
};

export const removeFavoriteService = async (serviceId) => {
  const response = await axiosInstance.delete(
    `/api/customers/favourite-services/${serviceId}`
  );
  return response.data;
};

export const getFavoriteServices = async () => {
  const response = await axiosInstance.get("/api/customers/favourite-services");
  return response.data;
};

export const checkFavoriteProvider = async (providerId) => {
  const response = await axiosInstance.get(
    `/api/customers/favourite-providers/${providerId}`
  );
  return response.data;
};

export const checkFavoriteService = async (serviceId) => {
  const response = await axiosInstance.get(
    `/api/customers/favourite-services/${serviceId}`
  );
  return response.data;
};
