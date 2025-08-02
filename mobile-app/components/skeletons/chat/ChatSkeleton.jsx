import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ChatSkeleton = () => (
  <ScrollView showsVerticalScrollIndicator={false} className="p-5">
    <View className="mb-6">
      <ShimmerPlaceholder
        style={{ width: "100%", height: 56, borderRadius: 12 }}
      />
    </View>

    {[...Array(6)].map((_, index) => (
      <View key={`skeleton-${index}`} className="flex-row items-center mb-5">
        <ShimmerPlaceholder
          style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }}
        />
        <View className="flex-1">
          <ShimmerPlaceholder
            style={{
              width: "70%",
              height: 14,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <ShimmerPlaceholder
            style={{ width: "40%", height: 12, borderRadius: 4 }}
          />
        </View>
      </View>
    ))}
  </ScrollView>
);

export default ChatSkeleton;
