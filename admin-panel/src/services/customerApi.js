import axiosInstance from "../api/axiosInstance";

export const getAllCustomers = async () => {
  const response = await axiosInstance.get("/api/admin/customers");
  return response.data;
};

export const getCustomerDetail = async (customerId) => {
  const response = await axiosInstance.get(`/api/admin/customer/${customerId}`);
  return response.data;
};

export const updateCustomerPhoneVerification = async (
  customerId,
  isPhoneVerified
) => {
  const response = await axiosInstance.put(
    `/api/admin/customer/${customerId}/phone-verification`,
    { isPhoneVerified }
  );
  return response.data;
};

export const updateCustomerBlockStatus = async (customerId, blockStatus) => {
  const response = await axiosInstance.put(
    `/api/admin/customer/${customerId}/block-unblock`,
    { blockStatus }
  );
  return response.data;
};
