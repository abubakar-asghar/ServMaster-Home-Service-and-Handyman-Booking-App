import { SplashScreen, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import "../global.css";
import store from "../store/store";
import queryClient from "../api/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { clearStorage, getUserFromStorage } from "../utils/storage";
import { useVerifyAuth } from "../hooks/useAuth";
import { setCredentials } from "../store/slices/authSlice";
import { initSocket } from "../utils/socket";
import { useChatStore } from "../zustand/chatStore";

SplashScreen.preventAutoHideAsync();

function AuthWrapper() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState(null);
  const { mutateAsync: verifyAuth } = useVerifyAuth();

  useEffect(() => {
    async function prepare() {
      try {
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

        const onboardingDone = await AsyncStorage.getItem("onboarding_done");
        const auth = await getUserFromStorage();

        console.log(auth);

        if (!auth?.token) {
          setInitialRoute(
            onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
          );
          return;
        }

        try {
          dispatch(
            setCredentials({
              user: auth.user,
              token: auth.token,
            })
          );

          setInitialRoute(
            auth.user.role === "Customer" ? "/customer/home" : "/provider/home"
          );
        } catch (error) {
          console.log(error);
          await clearStorage();
          setInitialRoute(
            onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
          );
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setInitialRoute("/auth/login");
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [dispatch]);

  useEffect(() => {
    async function setupSocket() {
      const socket = await initSocket();
      if (socket) {
        useChatStore.getState().setSocket(socket);
      }
    }

    if (appIsReady && user && token) {
      setupSocket();
    }

    return () => {
      useChatStore.getState().cleanup();
    };
  }, [appIsReady, user, token]);

  useEffect(() => {
    if (appIsReady && initialRoute) {
      router.replace(initialRoute);
    }
  }, [appIsReady, initialRoute]);

  if (!appIsReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <StatusBar style="dark" />
        <AuthWrapper />
      </Provider>
    </QueryClientProvider>
  );
}

// import { SplashScreen, Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Provider, useDispatch, useSelector } from "react-redux";
// import { useEffect, useState } from "react";
// import "../global.css";
// import store, { setCredentials } from "../store/store";
// import queryClient from "../api/queryClient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Font from "expo-font";
// import axiosInstance from "../api/axiosInstance";
// import { clearStorage, getUserFromStorage } from "../utils/storage";

// // Prevent splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();

// function AuthWrapper() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const [appIsReady, setAppIsReady] = useState(false);

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Load fonts
//         await Font.loadAsync({
//           "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
//           "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
//           "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
//           "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
//           "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
//           "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
//           "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
//           "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
//           "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
//         });

//         // Check authentication state
//         const onboardingDone = await AsyncStorage.getItem("onboarding_done");
//         const auth = await getUserFromStorage();

//         if (!auth?.token) {
//           return;
//         }

//         try {
//           const response = await axiosInstance.get(
//             "/api/auth/verify-logged-in",
//             {
//               headers: { Authorization: `Bearer ${auth.token}` },
//             }
//           );

//           if (response.data?.success) {
//             await dispatch(
//               setCredentials({
//                 user: response.data.data,
//                 token: auth.token,
//               })
//             ).unwrap();

//             router.replace(
//               auth.role === "Customer" ? "/customer/home" : "/provider/home"
//             );
//           } else {
//             throw new Error("Invalid token");
//           }
//         } catch (error) {
//           await clearStorage();
//           router.replace(
//             onboardingDone === "true" ? "/auth/login" : "/onboarding/step1"
//           );
//         }
//       } catch (error) {
//         console.error("Initialization error:", error);
//         router.replace("/auth/login");
//       } finally {
//         // Tell the application to render
//         setAppIsReady(true);
//         // Hide splash screen after everything is ready
//         await SplashScreen.hideAsync();
//       }
//     }

//     prepare();
//   }, [dispatch]);

//   if (!appIsReady) {
//     return null;
//   }

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
//         <AuthWrapper />
//       </Provider>
//     </QueryClientProvider>
//   );
// }

// // "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
// // "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
// // "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
// // "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
// // "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
// // "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
// // "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
// // "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
// // "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
