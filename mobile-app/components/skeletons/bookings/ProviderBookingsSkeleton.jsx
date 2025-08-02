import React from "react";
import { View, ScrollView } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ProviderBookingsSkeleton = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Dropdown Skeleton */}
      <View className="px-5 py-2 mt-3">
        <ShimmerPlaceholder
          style={{ width: "100%", height: 56, borderRadius: 16 }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5">
        <View className="my-4 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <View
              key={idx}
              className="rounded-2xl border-2 border-gray-200 p-4 space-y-5"
            >
              {/* Top Section */}
              <View className="flex-row justify-between gap-4">
                <View className="p-4 bg-muted-light rounded-2xl">
                  <ShimmerPlaceholder
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                    }}
                  />
                </View>
                <View className="flex-1 space-y-3 gap-4">
                  <View className="flex-row items-center justify-between">
                    <View className="w-[30%] bg-muted-light p-2 rounded-lg">
                      <ShimmerPlaceholder
                        style={{ width: "100%", height: 10 }}
                      />
                    </View>
                    <ShimmerPlaceholder style={{ width: "20%", height: 16 }} />
                  </View>
                  <ShimmerPlaceholder style={{ width: "70%", height: 20 }} />
                  <ShimmerPlaceholder style={{ width: "50%", height: 16 }} />
                </View>
              </View>

              <View className="bg-muted-light rounded-2xl p-4 space-y-4 mt-5 gap-4">
                {/* Info Section */}
                <View className="gap-2">
                  <ShimmerPlaceholder
                    style={{ width: "100%", height: 16, marginVertical: 8 }}
                  />
                  <ShimmerPlaceholder style={{ width: "100%", height: 1 }} />
                  <ShimmerPlaceholder
                    style={{ width: "100%", height: 16, marginVertical: 8 }}
                  />
                  <ShimmerPlaceholder style={{ width: "100%", height: 1 }} />
                  <ShimmerPlaceholder
                    style={{ width: "100%", height: 16, marginVertical: 8 }}
                  />
                </View>

                {/* Buttons */}
                {/* <View className="flex-row justify-between gap-4">
                  <ShimmerPlaceholder
                    style={{ width: "48%", height: 56, borderRadius: 8 }}
                  />
                  <ShimmerPlaceholder
                    style={{ width: "48%", height: 56, borderRadius: 8 }}
                  />
                </View> */}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProviderBookingsSkeleton;
