import axiosInstance from "../axiosInstance";

export const loginUser = async (data) => {
  const response = await axiosInstance.post("/api/auth/login", data);
  return response.data;
};
