import { useEffect, useState } from "react";
import { SplashScreen, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { getUserFromStorage } from "../utils/storage";
import { setCredentials } from "../store/slices/authSlice";
import * as Font from "expo-font";
import { socket } from "../utils/socket";
import { useChatStore } from "../zustand/chatStore";
import { useNavigation } from "expo-router";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const useInitialRedirect = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);
  const { updateLastMessageInChatList, selectedChat, addMessage } =
    useChatStore();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Load fonts
  useEffect(() => {
    (async () => {
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
        setFontsLoaded(true);
      } catch (err) {
        console.error("Font loading failed", err);
      }
    })();
  }, []);

  // Check onboarding status and user auth
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Check onboarding status first
        const onboardingValue = await AsyncStorage.getItem("onboarding_done");
        setOnboardingDone(onboardingValue === "true");

        // Check if we have user data in storage
        const storedAuth = await getUserFromStorage();

        if (storedAuth?.token) {
          try {
            // Verify token with backend
            const response = await axiosInstance.get(
              "/api/auth/verify-logged-in"
            );

            if (response.data?.success) {
              // Token is valid, set user in Redux store
              dispatch(
                setCredentials({
                  user: response.data.data,
                  token: storedAuth.token,
                })
              );
            } else {
              // Token is invalid, clear storage
              await clearAuthStorage();
            }
          } catch (error) {
            console.log("Auth verification failed:", error);
            await clearAuthStorage();
          }
        }
      } catch (error) {
        console.log("Initialization error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuthAndOnboarding();
  }, []);

  // Clear auth storage helper
  const clearAuthStorage = async () => {
    await AsyncStorage.multiRemove(["role", "token"]);
  };

  // Socket connection management
  useEffect(() => {
    if (!user?._id) return;

    // Connect socket and set up listeners
    socket.connect();
    socket.emit("join", user._id);

    const handleIncomingMessage = (newMessage) => {
      if (newMessage.chat === selectedChat?._id) {
        addMessage(newMessage);
      } else {
        Alert.alert(
          "New Message",
          `New message from ${newMessage.senderType}`,
          [
            {
              text: "Open Chat",
              onPress: () => router.push(`/provider/chat/${newMessage.chat}`),
            },
            { text: "Ignore", style: "cancel" },
          ]
        );
      }
      updateLastMessageInChatList(newMessage);
    };

    socket.on("newMessage", handleIncomingMessage);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.disconnect();
    };
  }, [user?._id, selectedChat]);

  // Handle redirection based on auth state
  useEffect(() => {
    if (
      !fontsLoaded ||
      !authChecked ||
      onboardingDone === null ||
      initialRedirectDone
    ) {
      return;
    }

    const performRedirect = async () => {
      // Wait a small delay for smoother transition
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!onboardingDone) {
        router.replace("/onboarding/step1");
      } else if (!user) {
        router.replace("/auth/login");
      } else if (user.role === "Customer") {
        router.replace("/customer/home");
      } else if (user.role === "ServiceProvider") {
        router.replace("/provider/home");
      }

      setInitialRedirectDone(true);
      SplashScreen.hideAsync();
    };

    performRedirect();
  }, [fontsLoaded, authChecked, onboardingDone, user, initialRedirectDone]);
};

export default useInitialRedirect;
// import { useEffect, useState } from "react";
// import { SplashScreen, router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useDispatch, useSelector } from "react-redux";
// import { getUserFromStorage } from "../utils/storage";
// import { setUserFromStorage } from "../store/slices/authSlice";
// import * as Font from "expo-font";
// import { socket } from "../utils/socket";
// import { useChatStore } from "../zustand/chatStore";
// import { useNavigation } from "expo-router";
// import { useRef } from "react";
// import { Alert, AppState } from "react-native";

// const useInitialRedirect = () => {
//   const [fontsLoaded, setFontsLoaded] = useState(false);
//   const [onboardingDone, setOnboardingDone] = useState(null);
//   const [checkingAuth, setCheckingAuth] = useState(true);
//   const [initialRedirectDone, setInitialRedirectDone] = useState(false);
//   const { updateLastMessageInChatList } = useChatStore();
//   const navigation = useNavigation();

//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   // Load fonts
//   useEffect(() => {
//     (async () => {
//       try {
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
//         setFontsLoaded(true);
//       } catch (err) {
//         console.error("Font loading failed", err);
//       }
//     })();
//   }, []);

//   // Load onboarding status
//   useEffect(() => {
//     const checkOnboarding = async () => {
//       const value = await AsyncStorage.getItem("onboarding_done");
//       setOnboardingDone(value === "true");
//     };
//     checkOnboarding();
//   }, []);

//   // Load user data
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const userData = await getUserFromStorage();
//         if (userData) {
//           dispatch(setUserFromStorage(userData));
//         }
//       } catch (error) {
//         console.log("Failed to load user:", error);
//       } finally {
//         setCheckingAuth(false);
//       }
//     };
//     loadUser();
//   }, []);

//   // Connect socket
//   useEffect(() => {
//     if (user?._id) {
//       socket.connect();
//       socket.emit("join", user._id);
//     }
//     return () => {
//       socket.disconnect();
//     };
//   }, [user]);

//   useEffect(() => {
//     const handleIncomingMessage = (newMessage) => {
//       const currentScreen = navigation.getCurrentRoute()?.name;

//       // 1. Add message to chatStore if it's part of selectedChat
//       if (newMessage.chat === selectedChat?._id) {
//         addMessage(newMessage);
//       } else {
//         // 2. Show alert or in-app notification
//         Alert.alert(
//           "New Message",
//           `New message from ${newMessage.senderType}`,
//           [
//             {
//               text: "Open Chat",
//               onPress: () => router.push(`/provider/chat/${newMessage.chat}`),
//             },
//             {
//               text: "Ignore",
//               style: "cancel",
//             },
//           ]
//         );
//       }

//       // 3. You may optionally update chat list with lastMessage
//       updateLastMessageInChatList(newMessage);
//     };

//     socket.on("newMessage", handleIncomingMessage);

//     return () => {
//       socket.off("newMessage", handleIncomingMessage);
//     };
//   }, []);

//   // Do redirection
//   useEffect(() => {
//     if (
//       fontsLoaded &&
//       !checkingAuth &&
//       onboardingDone !== null &&
//       !initialRedirectDone
//     ) {
//       SplashScreen.hideAsync();

//       if (!onboardingDone) {
//         router.replace("/onboarding/step1");
//       } else if (!user) {
//         router.replace("/auth/login");
//       } else if (user.role === "Customer") {
//         router.replace("/customer/home");
//       } else if (user.role === "ServiceProvider") {
//         router.replace("/provider/home");
//       }

//       setInitialRedirectDone(true);
//     }
//   }, [fontsLoaded, checkingAuth, onboardingDone, user, initialRedirectDone]);
// };

// export default useInitialRedirect;
