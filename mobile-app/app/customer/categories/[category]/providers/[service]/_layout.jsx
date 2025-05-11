import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ServiceProvidersBookingLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
