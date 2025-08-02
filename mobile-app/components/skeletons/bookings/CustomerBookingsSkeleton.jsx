import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const CustomerBookingsSkeleton = () => (
  <View className="flex-1 bg-white">
    {/* Search Skeleton */}
    <View className="px-5 py-2 mt-3">
      <ShimmerPlaceholder
        style={{ width: "100%", height: 56, borderRadius: 12 }}
      />
    </View>
    <ScrollView
      scrollEnabled
      showsVerticalScrollIndicator={false}
      className="px-5"
    >
      <View className="gap-4 my-4">
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            className="p-4 rounded-2xl border-2 border-gray-300"
          >
            {/* Top Section */}
            <View className="flex-row items-start justify-between gap-4">
              <View className="p-4 bg-muted-100 rounded-2xl">
                <ShimmerPlaceholder
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                />
              </View>
              <View className="flex-1 space-y-2">
                <View className="flex-row items-center justify-between">
                  <ShimmerPlaceholder
                    style={{ width: "30%", height: 14, borderRadius: 4 }}
                  />
                  <ShimmerPlaceholder
                    style={{ width: "20%", height: 14, borderRadius: 4 }}
                  />
                </View>
                <ShimmerPlaceholder
                  style={{
                    width: "50%",
                    height: 16,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                />
                <ShimmerPlaceholder
                  style={{
                    width: "40%",
                    height: 14,
                    borderRadius: 4,
                    marginTop: 6,
                  }}
                />
              </View>
            </View>

            {/* Info Section */}
            <View className="bg-gray-100 p-4 rounded-2xl mt-4 space-y-2">
              <ShimmerPlaceholder
                style={{ width: "100%", height: 12, borderRadius: 4 }}
              />
              <ShimmerPlaceholder
                style={{
                  width: "80%",
                  height: 12,
                  borderRadius: 4,
                  marginTop: 8,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

export default CustomerBookingsSkeleton;
