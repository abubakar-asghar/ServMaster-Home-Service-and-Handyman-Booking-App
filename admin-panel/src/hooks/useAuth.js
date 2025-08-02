import { setUser } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { adminLogin, isAuthenticated } from "../services/authApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { getToken, removeToken, setToken } from "../lib/storage";
import toast from "react-hot-toast";

export const useAdminLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  return useMutation({
    mutationKey: ["admin-login"],
    mutationFn: adminLogin,
    onSuccess: async (response) => {
      console.log(response);
      if (response) {
        console.log(response)
        toast.success(response?.message || "You are Logged in successfully");
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
      // removeToken();

      toast.error(error?.response?.data?.message || "Error while logging in");
    },
  });
};

export const useIsAuthenticated = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname()

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
        router.replace(pathname);
      }
    },
    onError: (error) => {
      removeToken();

      toast.error("Session expired. Please login again.");
    },
  });
};
