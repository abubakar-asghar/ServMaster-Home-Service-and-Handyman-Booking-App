import axiosInstance from "../axiosInstance";

export const createBooking = async (bookingData) => {
  const response = await axiosInstance.post(
    "/api/service-requests",
    bookingData
  );
  return response.data;
};

export const getCustomerBookings = async () => {
  const response = await axiosInstance.get(`/api/service-requests/customer`);
  return response.data;
};

export const getProvidersBookings = async () => {
  const response = await axiosInstance.get(`/api/service-requests/provider`);
  return response.data;
};

export const getBookingDetails = async (bookingId) => {
  const response = await axiosInstance.get(
    `/api/service-requests/details/${bookingId}`
  );
  return response.data;
};

export const updateBookingStatus = async (
  bookingId,
  status,
  reason,
  reasonType
) => {
  if (!bookingId || !status) {
    throw new Error("Booking ID and status are required");
  }

  let data = { status };

  // Only include reason and reasonType if status is "cancelled" and both are provided
  if (status === "cancelled") {
    if (!reason || !reasonType) {
      throw new Error(
        "Reason and reasonType are required when cancelling a booking"
      );
    }
    data.reason = reason;
    data.reason_type = reasonType;
  }

  const response = await axiosInstance.put(
    `/api/service-requests/update-status/${bookingId}`,
    data
  );
  return response.data;
};

export const cancelBookingFromCustomer = async (
  bookingId,
  reason,
  reasonType
) => {
  const response = await axiosInstance.put(
    `/api/service-requests/customer/cancel/${bookingId}`,
    { reason, reason_type: reasonType }
  );
  return response.data;
};
