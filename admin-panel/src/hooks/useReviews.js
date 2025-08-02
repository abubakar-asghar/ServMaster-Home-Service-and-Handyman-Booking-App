import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deleteReview,
  getAllReviews,
  getReviewStats,
} from "../services/reviewsApi";

export const useGetAllReviews = (params) =>
  useQuery({
    queryKey: ["reviews-ratings"],
    queryFn: getAllReviews,
    enabled: !!params,
  });

export const useGetReviewsStats = (categoryId) =>
  useQuery({
    queryKey: ["reviews-stats"],
    queryFn: getReviewStats,
  });

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review deleted!");
      queryClient.invalidateQueries(["reviews-ratings"]);
      queryClient.invalidateQueries(["reviews-stats"]);
    },
    onError: () => toast.error("Failed to delete review"),
  });
};
