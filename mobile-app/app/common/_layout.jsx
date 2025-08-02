import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function CommonLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <LinearGradient
        colors={[
          colors.primary,
          colors.primary,
          colors.primary,
          colors.mutedLight,
          colors.mutedLight,
          colors.mutedLight,
        ]}
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        >
          <Stack.Screen name="location-picker" />
        </Stack>
      </SafeAreaView>

      <StatusBar style="light" />
    </View>
  );
}
