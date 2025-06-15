import { Stack } from "expo-router";

export default function CustomerHomeLayout() {
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
