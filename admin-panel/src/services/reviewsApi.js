import axiosInstance from "../api/axiosInstance";

export const getAllReviews = async (params) => {
  const response = await axiosInstance.get(`/api/admin/reviews?${params}`);
  return response.data;
};

export const getReviewStats = async () => {
  const response = await axiosInstance.get(`/api/admin/reviews/stats`);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.get(`/api/admin/reviews/${reviewId}`);
  return response.data;
};
