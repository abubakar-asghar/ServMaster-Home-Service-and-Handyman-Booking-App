import { setUser } from "@/store/slices/authSlice";
import { useToast } from "./use-toast";
import { useDispatch } from "react-redux";
import { adminLogin, isAuthenticated } from "@/services/authApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getToken, removeToken, setToken } from "@/lib/storage";

export const useAdminLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["admin-login"],
    mutationFn: adminLogin,
    onSuccess: async (response) => {
      console.log(response);
      if (response) {
        toast({
          title: "Success",
          description: response?.message || "You are Logged in successfully",
        });
        setToken(response.token);
        dispatch(
          setUser({
            user: response.data,
            role: response.data?.role,
            token: response.token,
          })
        );
        router.replace("/dashboard/overview");
      }
    },
    onError: (error) => {
      removeToken();

      toast({
        title: "Oh! Something went wrong",
        description: error?.response?.data?.message || "Error while logging in",
        variant: "destructive",
      });
    },
  });
};

export const useIsAuthenticated = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: isAuthenticated,
    mutationKey: ["is-authenticated"],
    onSuccess: async (response) => {
      const token = getToken();

      if (token && response) {
        dispatch(
          setUser({
            user: response.data,
            role: response.data?.role,
            token,
          })
        );
        router.replace("/dashboard/overview");
      }
    },
    onError: (error) => {
      removeToken();

      toast({
        title: "Authentication Error",
        description:
          error?.response?.data?.message ||
          "Session expired. Please login again.",
        variant: "destructive",
      });
    },
  });
};
