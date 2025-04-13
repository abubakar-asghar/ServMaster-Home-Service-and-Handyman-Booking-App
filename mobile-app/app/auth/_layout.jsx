import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
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
    </>
  );
}
