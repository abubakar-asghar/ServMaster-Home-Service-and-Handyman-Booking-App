import axiosInstance from "../axiosInstance";

export const getCustomerById = async (customerId) => {
  const response = await axiosInstance.get(`/api/customers/${customerId}`);
  return response.data;
};
