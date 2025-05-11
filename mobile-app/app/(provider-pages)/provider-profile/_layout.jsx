import { Stack, Slot } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        // Hide tab bar on all nested profile screens
        headerStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Profile' }} />
      <Stack.Screen name="personal-info" options={{ title: 'Personal Information' }} />
      <Stack.Screen name="business-info" options={{ title: 'Business Information' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="phone-verification" options={{ title: 'Phone Verification' }} />
      <Stack.Screen name="identity-verification" options={{ title: 'Identity Verification' }} />
      <Stack.Screen name="professional-verification" options={{ title: 'Professional Verification' }} />
    </Stack>
  );
}
