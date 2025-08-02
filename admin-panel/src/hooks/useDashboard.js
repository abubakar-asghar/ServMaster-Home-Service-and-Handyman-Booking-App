import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getOverviewData, getStatisticsData } from "../services/dashboardApi";

export const useGetOverviewData = () =>
  useQuery({
    queryKey: ["overview-data"],
    queryFn: getOverviewData,
    refetchInterval: 300000,
  });

export const useGetStatisticsData = () =>
  useQuery({
    queryKey: ["statistics-data"],
    queryFn: getStatisticsData,
    refetchInterval: 300000,
  });
