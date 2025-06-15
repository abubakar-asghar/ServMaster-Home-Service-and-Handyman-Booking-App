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

export const updateBookingStatus = async (bookingId, status) => {
  const response = await axiosInstance.put(
    `/api/service-requests/${bookingId}`,
    { status }
  );
  return response.data;
};
