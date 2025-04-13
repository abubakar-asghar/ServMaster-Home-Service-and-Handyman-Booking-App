import { View, ActivityIndicator } from "react-native";

export default function Loader() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#0F2C59" />
    </View>
  );
}
