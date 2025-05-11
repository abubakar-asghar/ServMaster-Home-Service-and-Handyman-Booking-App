import { Stack, SplashScreen, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../api/queryClient";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import store from "../store/store";
import { setUserFromStorage } from "../store/slices/authSlice";
import { getUserFromStorage } from "../utils/storage";

SplashScreen.preventAutoHideAsync();

function Root() {
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

  const [onboardingDone, setOnboardingDone] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Load onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem("onboarding_done");
      setOnboardingDone(value === "true");
    };
    checkOnboarding();
  }, []);

  // Load user data
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const userData = await getUserFromStorage();
        if (userData) {
          dispatch(setUserFromStorage(userData)); // ✅ Use correct variable
        }
      } catch (err) {
        console.log("Error loading user:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Handle redirect
  useEffect(() => {
    if (fontsLoaded && !checkingAuth && onboardingDone !== null) {
      SplashScreen.hideAsync(); // ✅ Hide splash screen once everything is ready

      if (!onboardingDone) {
        router.replace("/onboarding/step1");
      } else if (!user) {
        router.replace("/auth/login");
      } else if (role === "customer") {
        router.replace("/customer/home");
      } else if (role === "provider") {
        router.replace("/provider/home");
      }
    }
  }, [fontsLoaded, error, checkingAuth, onboardingDone, user, role]);

  // Block render until everything is loaded
  if (!fontsLoaded || onboardingDone === null || checkingAuth) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
        {/* ✅ Register the screens here if needed */}
      </Stack>
      <StatusBar backgroundColor="#ffffff" style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Root />
      </Provider>
    </QueryClientProvider>
  );
}

// export default function RootLayout() {
//   const [fontsLoaded, error] = useFonts({
//     "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
//     "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
//     "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
//     "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
//     "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
//     "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
//     "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
//     "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
//     "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
//   });

//   const [showOnboarding, setShowOnboarding] = useState(null);

//   useEffect(() => {
//     if (error) throw error;
//     if (fontsLoaded) SplashScreen.hideAsync();
//   }, [fontsLoaded, error]);

//   useEffect(() => {
//     const checkOnboarding = async () => {
//       const value = await AsyncStorage.getItem("onboarding_done");
//       setShowOnboarding(value === "true");
//     };
//     checkOnboarding();
//   }, []);

//   if (!fontsLoaded || showOnboarding === null) return null;

//   console.log("Onboarding value:", showOnboarding);

//   return (
//     <>
//       <QueryClientProvider client={queryClient}>
//         <Provider store={store}>
//           <Stack screenOptions={{ headerShown: false }}>
//             <Stack.Screen
//               name={showOnboarding ? "index" : "/onboarding/step1"}
//             />
//             <Stack.Screen name="+not-found" />
//           </Stack>
//         </Provider>
//       </QueryClientProvider>

//       <StatusBar backgroundColor="#ffffff" style="dark" />
//     </>
//   );
// }
