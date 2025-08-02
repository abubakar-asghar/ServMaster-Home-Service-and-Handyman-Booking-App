import { Stack } from "expo-router";

export default function ProfileStackLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      >
        <Stack.Screen name="index" />
        <Stack screenOptions={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
