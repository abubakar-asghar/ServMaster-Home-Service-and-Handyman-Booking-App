import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const MessagesSkeleton = () => {
  return (
    <View className="flex-1 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          style={{
            alignSelf: index % 2 === 0 ? "flex-end" : "flex-start",
            backgroundColor: index % 2 === 0 ? "#e5e7eb" : "#d1d5db",
            borderTopLeftRadius: index % 2 === 0 ? 12 : 0,
            borderTopRightRadius: index % 2 === 0 ? 0 : 12,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 12,
            maxWidth: "75%",
          }}
        >
          <ShimmerPlaceholder
            style={{
              height: 16,
              width: "80%",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <ShimmerPlaceholder
            style={{
              height: 12,
              width: 80,
              borderRadius: 4,
              alignSelf: "flex-end",
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default MessagesSkeleton;
