import axiosInstance from "../api/axiosInstance";

export const getAllCustomers = async () => {
  const response = await axiosInstance.get("/api/admin/customers");
  return response.data;
};

export const getCustomerDetail = async (customerId) => {
  const response = await axiosInstance.get(`/api/admin/customer/${customerId}`);
  return response.data;
};
