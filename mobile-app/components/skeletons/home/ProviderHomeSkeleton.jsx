import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { View, ScrollView } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ProviderHomeSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-gray-50 px-5"
    >
      {/* Welcome Header */}
      <View className="mt-4 mb-6 gap-3">
        <ShimmerPlaceholder
          style={{ width: 200, height: 32, borderRadius: 6 }}
          className="mb-2"
        />
        <ShimmerPlaceholder
          style={{ width: 180, height: 20, borderRadius: 6 }}
        />
      </View>

      {/* Stats Cards */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mt-4 mb-6">
        {[1, 2, 3, 4].map((item) => (
          <View
            key={item}
            className="py-5 px-3 w-[48%] rounded-xl bg-white border border-gray-100"
          >
            <View className="flex-row items-center justify-between">
              <View className="gap-2">
                <ShimmerPlaceholder
                  style={{ width: 100, height: 16, borderRadius: 4 }}
                  className="mb-3"
                />
                <ShimmerPlaceholder
                  style={{ width: 70, height: 20, borderRadius: 4 }}
                />
              </View>
              <ShimmerPlaceholder
                style={{ width: 44, height: 44, borderRadius: 12 }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions Header */}
      <ShimmerPlaceholder
        style={{ width: 120, height: 24, borderRadius: 4 }}
      />

      {/* Quick Actions */}
      <View className="flex-row justify-between mt-4 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <View
            key={item}
            className="py-4 items-center rounded-xl bg-white border border-gray-100 w-[23%] gap-4"
          >
            <ShimmerPlaceholder
              style={{ width: 36, height: 36, borderRadius: 50 }}
            />
            <ShimmerPlaceholder
              style={{ width: 60, height: 16, borderRadius: 4 }}
            />
          </View>
        ))}
      </View>

      {/* Bookings Status Header */}
      <ShimmerPlaceholder
        style={{ width: 140, height: 24, borderRadius: 4 }}
      />

      {/* Bookings Status Cards */}
      <View className="flex-row mt-4 mb-8">
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="p-4 rounded-xl bg-white border border-gray-100 flex-1 mx-1 gap-2"
          >
            <ShimmerPlaceholder
              style={{ width: 80, height: 16, borderRadius: 4 }}
              className="mb-3"
            />
            <ShimmerPlaceholder
              style={{ width: 50, height: 24, borderRadius: 4 }}
            />
          </View>
        ))}
      </View>

      {/* Recent Activity Header */}
      <ShimmerPlaceholder
        style={{ width: 140, height: 24, borderRadius: 4 }}
      />

      {/* Recent Activity List */}
      <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4 mb-8 gap-4">
        {[1, 2, 3].map((item) => (
          <View key={item} className="flex-row items-center mb-5 last:mb-0 gap-4">
            <ShimmerPlaceholder
              style={{ width: 40, height: 40, borderRadius: 12 }}
              className="mr-3"
            />
            <View className="flex-1 gap-1">
              <ShimmerPlaceholder
                style={{ width: "70%", height: 18, borderRadius: 4 }}
                className="mb-2"
              />
              <ShimmerPlaceholder
                style={{ width: "50%", height: 14, borderRadius: 4 }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Performance Header */}
      <ShimmerPlaceholder
        style={{ width: 120, height: 24, borderRadius: 4 }}
      />

      {/* Performance Metrics */}
      <View className="bg-white rounded-xl p-4 border border-gray-100 mt-4 mb-10 gap-4">
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="flex-row justify-between items-center mb-4 last:mb-0 gap-2"
          >
            <ShimmerPlaceholder
              style={{ width: 120, height: 16, borderRadius: 4 }}
            />
            <ShimmerPlaceholder
              style={{ width: 60, height: 20, borderRadius: 4 }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProviderHomeSkeleton;
