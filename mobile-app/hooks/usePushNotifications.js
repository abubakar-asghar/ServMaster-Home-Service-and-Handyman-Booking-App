import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import axiosInstance from "../api/axiosInstance";

export default function usePushNotifications(user) {
  useEffect(() => {
    if (!user?._id) return;

    console.log("Registering push notifications for user:", user._id);

    const registerForPushNotifications = async () => {
      try {
        let token;

        if (Device.isDevice) {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== "granted") {
            Alert.alert(
              "Permission required",
              "Please enable notifications in settings."
            );
            return;
          }

          token = (await Notifications.getExpoPushTokenAsync()).data;

          // Optional: Android channel setup
          if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
              name: "default",
              importance: Notifications.AndroidImportance.MAX,
            });
          }

          // ✅ Send token to backend
          await axiosInstance.put(`/api/auth/save-push-token`, {
            userId: user._id,
            role: user.role,
            expoPushToken: token,
          });
        } else {
          Alert.alert(
            "Error",
            "Must use physical device for Push Notifications"
          );
        }
      } catch (err) {
        console.error("Error getting push token:", err);
      }
    };

    registerForPushNotifications();
  }, [user]);
}
