import axiosInstance from "../axiosInstance";

export const registerProvider = async (data) => {
  const response = await axiosInstance.post(
    "/api/auth/register/service-provider",
    data
  );
  return response.data;
};

export const getAllProviders = async () => {
  const response = await axiosInstance.get(`/api/service-providers/all`);
  return response.data;
};

export const getProviderProfileForCustomer = async (providerId) => {
  const response = await axiosInstance.get(
    `/api/service-providers/profile/${providerId}`
  );
  return response.data;
};

export const getProvidersByService = async (serviceId, location) => {
  if (!location) {
    const response = await axiosInstance.get(
      `/api/service-providers/all/${serviceId}`
    );
    return response.data;
  }

  const params = {
    lat:
      location.coordinates?.latitude ||
      location.latitude ||
      location.points?.latitude,
    long:
      location.coordinates?.longitude ||
      location.longitude ||
      location.points?.longitude,
  };
  if (location.city || location.address)
    params.city = location?.city || location.address?.city;
  if (location.state || location.address)
    params.state = location?.state || location.address?.region;

  const response = await axiosInstance.get(
    `/api/service-providers/all/${serviceId}`,
    { params }
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

// Update your updateProviderBusinessInfo function
export const updateProviderBusinessInfo = async (data) => {
  try {
    console.log("Sending data:", data); // Log the outgoing data
    const response = await axiosInstance.put(
      "/api/service-providers/business-info",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // Add 30s timeout
      }
    );
    console.log("Received response:", response.data); // Log the response
    return response.data;
  } catch (error) {
    console.error("Detailed API error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack,
    });
    throw error;
  }
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
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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

export const getServiceDetails = async (serviceId) => {
  const response = await axiosInstance.get(
    `/api/service-providers/service-detail/${serviceId}`
  );
  return response.data;
};

export const addServices = async (data) => {
  const response = await axiosInstance.post(
    "/api/service-providers/add-services",
    data
  );
  return response.data;
};

export const deleteService = async (serviceId) => {
  const response = await axiosInstance.delete(
    `/api/service-providers/services/${serviceId}`
  );
  return response.data;
};

export const updateSerivce = async (data) => {
  const response = await axiosInstance.put(
    `/api/service-providers/services/${data.serviceId}`,
    data
  );
  return response.data;
};

export const getProviderDashboardStats = async () => {
  const response = await axiosInstance.get("/api/service-providers/dashboard");
  return response.data.data;
};
