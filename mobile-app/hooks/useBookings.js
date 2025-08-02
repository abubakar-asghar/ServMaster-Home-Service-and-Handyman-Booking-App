import { useDispatch } from "react-redux";
import {
  cancelBookingFromCustomer,
  createBooking,
  getBookingDetails,
  getCustomerBookings,
  getProvidersBookings,
  updateBookingStatus,
} from "../api/services/bookingApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { addCustomerBooking } from "../store/slices/customerBookingsSlice";

export const useCreateBookingRequest = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    mutationKey: ["create-booking-request"],
    onSuccess: async (data) => {
      dispatch(addCustomerBooking(data?.data));
      queryClient.invalidateQueries(["customer-bookings"]);
      Alert.alert(
        "Success",
        data?.message || "Booking request created successfully"
      );
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.message || "Failed to create booking request"
      );
    },
  });
};

export const useGetCustomerBookings = () => {
  return useQuery({
    queryKey: ["customer-bookings"],
    queryFn: getCustomerBookings,
  });
};

export const useGetProviderBookings = () => {
  return useQuery({
    queryKey: ["provider-bookings"],
    queryFn: getProvidersBookings,
  });
};

export const useGetBookingDetails = (bookingId) => {
  return useQuery({
    queryKey: ["booking-details" + bookingId],
    queryFn: () => getBookingDetails(bookingId),
    enabled: !!bookingId,
  });
};

// Hook to update booking status (Only for providers)
export const useUpdateBookingStatus = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status, reason, reasonType }) =>
      updateBookingStatus(
        bookingId,
        status,
        reason ?? null,
        reasonType ?? null
      ),
    mutationKey: ["update-booking-status"],
    onSuccess: async (data) => {
      queryClient.invalidateQueries(["provider-bookings"]);
      queryClient.invalidateQueries(["booking-details" + data?.data?._id]);
      Alert.alert("Success", data?.message || "Service request status updated");
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error?.message || "Failed to update Service Request status"
      );
    },
  });
};

export const useCancelBookingFromCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason, reasonType }) =>
      cancelBookingFromCustomer(bookingId, reason, reasonType),
    mutationKey: ["cancel-booking-from-customer"],
    onSuccess: async (data) => {
      queryClient.invalidateQueries(["customer-bookings"]);
      queryClient.invalidateQueries(["booking-details" + data?.data?._id]);
      Alert.alert("Success", data?.message || "Booking canceled");
    },
    onError: (error) => {
      Alert.alert("Error", error?.message || "Failed while cancel booking");
    },
  });
};
