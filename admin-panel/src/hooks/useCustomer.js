import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAllCustomers, getCustomerDetail } from "../services/customerApi";

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
