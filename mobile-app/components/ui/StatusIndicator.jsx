import { View, Text } from "react-native";
import clsx from "clsx";

export default function StatusIndicator({ status }) {
  return (
    <View className="flex-row items-center">
      <View
        className={clsx("w-3 h-3 rounded-full mr-2", {
          "bg-green-500": status === "Online",
          "bg-gray-400": status === "Offline",
          "bg-yellow-500": status === "Busy",
          "bg-blue-500": status === "Free",
        })}
      />
      <Text className="text-text">{status}</Text>
    </View>
  );
}
