import { SplashScreen, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import "../global.css";
import store, { setCredentials } from "../store/store";
import queryClient from "../api/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import axiosInstance from "../api/axiosInstance";
import { View, Text } from "react-native";
import { clearStorage, getUserFromStorage } from "../utils/storage";

SplashScreen.preventAutoHideAsync();

function AuthWrapper() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Load fonts
        await Font.loadAsync({
          "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
          "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
          "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
          "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
          "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
          "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
          "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
          "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
          "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
        });
        setFontsLoaded(true);

        // 2. Check onboarding status
        const onboardingDone = await AsyncStorage.getItem("onboarding_done");

        console.log(onboardingDone);

        // 3. Check auth status
        const auth = await getUserFromStorage();
        console.log(auth);

        if (!auth?.token) {
          router.replace(
            onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
          );
          return;
        }

        // 4. Verify token if exists
        try {
          const response = await axiosInstance.get(
            "/api/auth/verify-logged-in"
          );
          if (response.data?.success) {
            console.log(response.data);
            dispatch(
              setCredentials({
                user: response.data.data,
                token: auth.token,
              })
            );
            router.replace(
              auth.role === "Customer" ? "/customer/home" : "/provider/home"
            );
          } else {
            throw new Error("Invalid token");
          }
        } catch (error) {
          await clearStorage();
          router.replace(
            onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
          );
        }
      } catch (error) {
        console.error("Initialization error:", error);
        router.replace("/auth/login");
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Small delay for smoother transition
    const timer = setTimeout(() => setAppIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <StatusBar style="dark" />
        <AuthWrapper />
      </Provider>
    </QueryClientProvider>
  );
}
