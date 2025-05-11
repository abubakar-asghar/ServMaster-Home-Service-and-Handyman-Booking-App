import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      cacheTime: 1000 * 60 * 10, // Keep inactive cache for 10 minutes
      refetchOnWindowFocus: false, // Avoid refetching when switching tabs
      retry: 3, // Retry failed requests once
    },
  },
});

export default queryClient;
