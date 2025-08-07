import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllCustomers,
  getCustomerDetail,
  updateCustomerBlockStatus,
  updateCustomerPhoneVerification,
} from "../services/customerApi";

export const useGetAllCustomers = () => {
  return useQuery({
    queryKey: ["all-customers"],
    queryFn: getAllCustomers,
  });
};

export const useGetCustomerDetail = (customerId) => {
  return useQuery({
    queryKey: ["customer-detail" + customerId],
    queryFn: () => getCustomerDetail(customerId),
    enabled: !!customerId,
  });
};

export const useUpdateCustomerPhoneVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, phoneStatus }) =>
      updateCustomerPhoneVerification(customerId, phoneStatus),
    onSuccess: (res) => {
      toast.success(
        res.message || "Customer phone verification updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });
    },
    onError: () => {
      toast.error("Failed to update customer phone verification");
    },
  });
};

export const useUpdateCustomerBlockStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, blockStatus }) =>
      updateCustomerBlockStatus(customerId, blockStatus),
    onSuccess: (res) => {
      toast.success(res.message || "Customer status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });
    },
    onError: () => {
      toast.error("Failed to update customer status");
    },
  });
};
