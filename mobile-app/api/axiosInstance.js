import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { clearStorage } from "../utils/storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const API_BASE_URL = "http://192.168.0.104:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token from secure storage
axiosInstance.interceptors.request.use(
  async (config) => {
    const authData = await SecureStore.getItemAsync("auth");
    const parsed = authData ? JSON.parse(authData) : null;
    const token = parsed?.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
