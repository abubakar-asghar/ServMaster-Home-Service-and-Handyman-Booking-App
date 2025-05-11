import { useQuery } from "@tanstack/react-query";
import { getServiceCategories, getSubServicesByParent } from "../api/services/serviceApi";

export const useGetServiceCategories = () => {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: getServiceCategories,
  });
};

export const useGetSubServicesByParent = (parentId) => {
  return useQuery({
    queryKey: ["sub-services", parentId],
    queryFn: () => getSubServicesByParent(parentId),
    enabled: !!parentId,
  });
}