import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllServiceCategories,
  createNewServiceCategory,
  getServiceCategoryDetail,
  updateServiceCategory,
  deleteServiceCategory,
  getAllServices,
  createNewService,
  getServiceDetail,
  updateService,
  deleteService,
} from "../services/servicesApi";

// Service Category Hooks

export const useGetAllServiceCategories = () =>
  useQuery({
    queryKey: ["serviceCategories"],
    queryFn: getAllServiceCategories,
  });

export const useServiceCategoryDetail = (categoryId) =>
  useQuery({
    queryKey: ["serviceCategory", categoryId],
    queryFn: () => getServiceCategoryDetail(categoryId),
    enabled: !!categoryId,
  });

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewServiceCategory,
    onSuccess: () => {
      toast.success("Service category created!");
      queryClient.invalidateQueries(["serviceCategories"]);
    },
    onError: () => toast.error("Failed to create service category"),
  });
};

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, formData }) =>
      updateServiceCategory(categoryId, formData),
    onSuccess: () => {
      toast.success("Service category updated!");
      queryClient.invalidateQueries(["serviceCategories"]);
    },
    onError: () => toast.error("Failed to update service category"),
  });
};

export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      toast.success("Service category deleted!");
      queryClient.invalidateQueries(["serviceCategories"]);
    },
    onError: () => toast.error("Failed to delete service category"),
  });
};

// Service Hooks

export const useGetAllServices = () =>
  useQuery({
    queryKey: ["services"],
    queryFn: getAllServices,
  });

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewService,
    onSuccess: () => {
      toast.success("Service created!");
      queryClient.invalidateQueries(["services"]);
    },
    onError: (error) =>
      toast.error(error.message || "Failed to create service"),
  });
};

export const useServiceDetail = (serviceId) =>
  useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getServiceDetail(serviceId),
    enabled: !!serviceId,
  });

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, ...data }) => updateService(serviceId, data),
    onSuccess: () => {
      toast.success("Service updated!");
      queryClient.invalidateQueries(["services"]);
    },
    onError: (error) =>
      toast.error(error.message || "Failed to update service"),
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success("Service deleted!");
      queryClient.invalidateQueries(["services"]);
    },
    onError: (error) =>
      toast.error(error.message || "Failed to delete service"),
  });
};
