import axiosInstance from "../api/axiosInstance";

export const getOverviewData = async () => {
  const response = await axiosInstance.get("/api/admin/dashboard/overview");
  return response.data;
};

export const getStatisticsData = async () => {
  const response = await axiosInstance.get("/api/admin/dashboard/statistics");
  return response.data;
};
