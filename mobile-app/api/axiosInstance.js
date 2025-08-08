import axios from "axios";
import { clearStorage, getUserFromStorage } from "../utils/storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const API_BASE_URL = "http://192.168.0.106:5000";
// const API_BASE_URL = "https://servmaster-backend.vercel.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token from secure storage
axiosInstance.interceptors.request.use(
  async (config) => {
    const authData = await getUserFromStorage();
    if (authData?.token) {
      config.headers["Authorization"] = `Bearer ${authData?.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Alert.alert("Unauthorized", "Logging out...");
      await clearStorage();
      router.replace("auth/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
