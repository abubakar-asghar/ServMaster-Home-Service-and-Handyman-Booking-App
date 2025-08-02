import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  // const { user } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   if (!user) {
  //     return;
  //   } else if (user._id && user.role === "Customer") {
  //     router.replace("/customer/home");
  //   } else if (user._id && user.role === "ServiceProvider") {
  //     router.replace("/provider/home");
  //   }
  // }, [user]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="select-role" />
        <Stack.Screen name="login" />
        <Stack.Screen name="customer-register" />
        <Stack.Screen name="provider-register" />
        <Stack.Screen name="forgot-password" />
      </Stack>

      <StatusBar backgroundColor="#ffffff" style="dark" />
    </SafeAreaView>
  );
}
