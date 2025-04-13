import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import clsx from "clsx";

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={clsx("w-full py-3 rounded-lg items-center", {
        "bg-primary": variant === "primary",
        "bg-secondary": variant === "secondary",
        "border border-primary bg-transparent": variant === "outline",
        "opacity-50": disabled,
      })}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-lg font-semibold">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
