import axiosInstance from "../axiosInstance";

export const registerCustomer = async (data) => {
  const response = await axiosInstance.post("/api/customers/register", data);
  return response.data;
};

export const getCustomerById = async (customerId) => {
  const response = await axiosInstance.get(`/api/customers/${customerId}`);
  return response.data;
};
