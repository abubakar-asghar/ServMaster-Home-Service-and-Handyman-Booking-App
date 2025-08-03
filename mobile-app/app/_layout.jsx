import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import "../global.css";
import store from "../store/store";
import queryClient from "../api/queryClient";
import useInitialRedirect from "../hooks/useInitialRedirect";
import useNavigationStore from "../zustand/navigationStore";
import { router } from "expo-router";
import { BackHandler, View } from "react-native";
import usePushNotifications from "../hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync();

function Root() {
  const {
    previousRoute,
    backHandlingEnabled,
    clearPreviousRoute,
    disableBackHandling,
  } = useNavigationStore();

  // Initialize push notifications
  const { user } = useSelector((state) => state.auth);

  // Initialize push notifications
  usePushNotifications(user);

  // Initialize socket when user logs in
  useEffect(() => {
    if (user?.token) {
      initializeSocket(user.token);
    }
    return () => {
      disconnectSocket();
    };
  }, [user?.token]);

  // Android back handler
  useEffect(() => {
    const onBackPress = () => {
      if (backHandlingEnabled && previousRoute) {
        router.replace(previousRoute);
        clearPreviousRoute();
        disableBackHandling();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [backHandlingEnabled, previousRoute]);

  useInitialRedirect();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Pre-load any resources while showing splash screen
  useEffect(() => {
    async function prepare() {
      try {
        // Add any async pre-loading here if needed
        await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for smoother transition
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Keep splash screen visible
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <StatusBar style="dark" />
        <Root />
      </Provider>
    </QueryClientProvider>
  );
}
// import { SplashScreen, Stack } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Provider } from "react-redux";
// import { useEffect, useState } from "react";
// import * as Font from "expo-font";
// import "../global.css";
// import store from "../store/store";
// import queryClient from "../api/queryClient";
// import useInitialRedirect from "../hooks/useInitialRedirect";
// import useNavigationStore from "../zustand/navigationStore";
// import { router } from "expo-router";
// import { BackHandler } from "react-native";

// SplashScreen.preventAutoHideAsync();

// function Root() {
//   const {
//     previousRoute,
//     backHandlingEnabled,
//     clearPreviousRoute,
//     disableBackHandling,
//   } = useNavigationStore();

//   // Android back handler
//   useEffect(() => {
//     const onBackPress = () => {
//       if (backHandlingEnabled && previousRoute) {
//         router.replace(previousRoute);
//         clearPreviousRoute();
//         disableBackHandling();
//         return true;
//       }
//       return false;
//     };
//     const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
//     return () => sub.remove();
//   }, [backHandlingEnabled, previousRoute]);

//   useInitialRedirect();

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="+not-found" />
//     </Stack>
//   );
// }

// export default function RootLayout() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Provider store={store}>
//         <StatusBar style="dark" />
//         <Root />
//       </Provider>
//     </QueryClientProvider>
//   );
// }

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
