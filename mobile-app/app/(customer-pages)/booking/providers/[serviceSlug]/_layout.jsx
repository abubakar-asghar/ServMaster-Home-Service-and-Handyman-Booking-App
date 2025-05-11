import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ServiceProvidersBookingLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />

      <StatusBar backgroundColor="#ffffff" style="dark" />
    </>
  );
}
