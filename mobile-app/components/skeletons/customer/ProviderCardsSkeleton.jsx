import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ProviderCardsSkeleton = () => (
  <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
    <View className="flex-row items-center mb-4 gap-3">
      <ShimmerPlaceholder style={{ width: 60, height: 60, borderRadius: 12 }} />
      <View className="flex-1 gap-2">
        <ShimmerPlaceholder
          style={{ width: "70%", height: 16, borderRadius: 4 }}
        />
        <ShimmerPlaceholder
          style={{ width: "50%", height: 14, borderRadius: 4 }}
        />
      </View>
    </View>
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <ShimmerPlaceholder
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View className="ml-3">
          <ShimmerPlaceholder
            style={{ width: 100, height: 14, borderRadius: 4 }}
          />
          <ShimmerPlaceholder
            style={{ width: 80, height: 12, borderRadius: 4, marginTop: 4 }}
          />
        </View>
      </View>
      <ShimmerPlaceholder style={{ width: 70, height: 14, borderRadius: 4 }} />
    </View>
    <ShimmerPlaceholder
      style={{ width: "100%", height: 40, borderRadius: 8, marginTop: 16 }}
    />
  </View>
);

export default ProviderCardsSkeleton;
