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
        <Stack.Screen name="personal-info" title="my info" />
        {/* <Stack.Screen name="business-info" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="phone-verification" />
      <Stack.Screen name="identity-verification" />
      <Stack.Screen name="professional-verification" /> */}
      </Stack>
    </>
  );
}
