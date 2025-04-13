import { View, Text } from "react-native";
import { Star } from "lucide-react-native";

export default function Rating({ rating }) {
  return (
    <View className="flex-row items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={20}
          color={index < rating ? "#FACC15" : "#D1D5DB"} // Yellow for filled stars
          fill={index < rating ? "#FACC15" : "none"}
        />
      ))}
      <Text className="ml-2 text-text">{rating.toFixed(1)}</Text>
    </View>
  );
}
