import axiosInstance from "../axiosInstance";

export const getServiceCategories = async () => {
  const response = await axiosInstance.get("/api/service-categories/all");
  return response.data;
};

export const getSubServicesByParent = async (parentId) => {
  const response = await axiosInstance.get(`/api/sub-services/parent/${parentId}`);
  return response.data;
};
