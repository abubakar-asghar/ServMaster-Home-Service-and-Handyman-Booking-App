import axiosInstance from "../axiosInstance";

export const loginUser = async (data) => {
  const response = await axiosInstance.post("/api/auth/login", data);
  return response.data;
};

export const verifyUserPhone = async (data) => {
  const response = await axiosInstance.post("/api/auth/verify", data);
  return response.data;
};

export const resendVerificationCode = async (phone) => {
  const response = await axiosInstance.post("/api/auth/resend-verification", {
    phone,
  });
  return response.data;
};
