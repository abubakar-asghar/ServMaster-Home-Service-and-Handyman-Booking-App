import { Stack, SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import store from "../store/store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
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

  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem("onboarding_done");
      setShowOnboarding(value === "true");
    };
    checkOnboarding();
  }, []);

  if (!fontsLoaded || showOnboarding === null) return null;

  console.log("Onboarding value:", showOnboarding);

  return (
    <>
      <Provider store={store}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name={showOnboarding ? "index" : "(onboarding)"} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </Provider>

      <StatusBar backgroundColor="#ffffff" style="dark" />
    </>
  );
}
