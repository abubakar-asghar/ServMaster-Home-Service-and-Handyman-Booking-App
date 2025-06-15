import axiosInstance from "../api/axiosInstance";

export const adminLogin = async (data) => {
  const response = await axiosInstance.post("/api/admin/login", data);
  return response.data;
};

export const createAdmin = async (data) => {
  const response = await axiosInstance.post("/api/admin/create", data);
  return response.data;
};

export const isAuthenticated = async () => {
  const response = await axiosInstance.get("/api/admin/profile");
  return response.data;
};
