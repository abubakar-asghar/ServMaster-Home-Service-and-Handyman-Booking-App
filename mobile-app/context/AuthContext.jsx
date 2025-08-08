import { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/axiosInstance";
import { clearStorage, getUserFromStorage } from "../utils/storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const auth = await getUserFromStorage();
        const onboardingDone = await AsyncStorage.getItem("onboarding_done");

        if (!auth?.token) {
          router.replace(
            onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
          );
          return;
        }

        const response = await axiosInstance.get("/api/auth/verify-logged-in", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        if (response.data?.success) {
          setUser({
            ...response.data.data,
            token: auth.token,
            role: auth.role,
          });

          router.replace(
            auth.role === "Customer" ? "/customer/home" : "/provider/home"
          );
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        await clearStorage();
        const onboardingDone = await AsyncStorage.getItem("onboarding_done");
        router.replace(
          onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
