import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReview,
  deleteReview,
  updateReview,
} from "../api/services/reviewApi";
import { Alert } from "react-native";

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    mutationKey: ["createReview"],
    onSuccess: (data) => {
      Alert.alert("Success", "Review created successfully!");
      queryClient.invalidateQueries([
        "booking-details" + data?.data?.service_request,
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create review. Please try again.");
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    mutationKey: ["updateReview"],
    onSuccess: (data) => {
      Alert.alert("Success", "Review updated successfully!");
      queryClient.invalidateQueries([
        "booking-details" + data?.data?.service_request,
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update review. Please try again.");
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    mutationKey: ["deleteReview"],
    onSuccess: (data) => {
      Alert.alert("Success", "Review deleted successfully!");
      queryClient.invalidateQueries([
        "booking-details" + data?.data?.service_request,
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to delete review. Please try again.");
    },
  });
};
