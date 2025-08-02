import axiosInstance from "../axiosInstance";

export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post("/api/reviews/new", reviewData);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const updateReview = async (reviewData) => {
  try {
    const response = await axiosInstance.put(
      `/api/reviews/${reviewData.reviewId.toString()}`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/reviews/${reviewId.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
