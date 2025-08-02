import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const CustomerBookingDetailsSkeleton = () => (
  <View className="flex-1 bg-white">
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="p-5 space-y-8">
        {/* Booking ID */}
        <View className="space-y-2 flex-row items-center justify-between">
          <ShimmerPlaceholder
            style={{ width: 150, height: 24, borderRadius: 6 }}
          />
          <ShimmerPlaceholder
            style={{ width: 60, height: 24, borderRadius: 6 }}
          />
        </View>

        <View className="mt-4 items-center">
          <ShimmerPlaceholder style={{ width: "100%", height: 1 }} />
        </View>

        {/* Service Info */}
        <View className="space-y-3">
          <ShimmerPlaceholder
            style={{ width: "50%", height: 20, borderRadius: 6, marginTop: 24 }}
          />
          <View className="flex-row bg-muted-light p-4 rounded-xl items-center gap-4 mt-3">
            <ShimmerPlaceholder
              style={{ width: 56, height: 56, borderRadius: 12 }}
            />
            <View className="flex-1 gap-4">
              <ShimmerPlaceholder
                style={{
                  width: "60%",
                  height: 16,
                  borderRadius: 6,
                }}
              />
              <ShimmerPlaceholder
                style={{
                  width: "60%",
                  height: 16,
                  borderRadius: 6,
                }}
              />
            </View>
          </View>
        </View>

        {/* Notes */}
        <View className="space-y-3">
          <ShimmerPlaceholder
            style={{ width: "50%", height: 20, borderRadius: 6, marginTop: 24 }}
          />
          <ShimmerPlaceholder
            style={{
              width: "100%",
              height: 60,
              borderRadius: 6,
              marginTop: 10,
            }}
          />
        </View>

        {/* Provider Info */}
        <View className="space-y-3 gap-4 mt-6">
          <ShimmerPlaceholder
            style={{ width: "60%", borderRadius: 6, height: 20 }}
          />
          <View className="bg-gray-100 rounded-2xl p-5 space-y-6">
            <View className="flex-row items-center gap-4">
              <ShimmerPlaceholder
                style={{ width: 50, height: 50, borderRadius: 100 }}
              />
              <View className="flex-1 space-y-3">
                <ShimmerPlaceholder style={{ width: "70%", height: 14 }} />
                <ShimmerPlaceholder
                  style={{
                    width: "50%",
                    height: 12,
                    borderRadius: 6,
                    marginTop: 10,
                  }}
                />
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-6">
              <ShimmerPlaceholder
                style={{ width: "30%", height: 56, borderRadius: 8 }}
              />
              <ShimmerPlaceholder
                style={{
                  width: "30%",
                  height: 56,
                  borderRadius: 8,
                }}
              />
              <ShimmerPlaceholder
                style={{
                  width: "30%",
                  height: 56,
                  borderRadius: 8,
                }}
              />
            </View>
          </View>
        </View>

        {/* Price */}
        <View className="space-y-5 gap-4 mt-6">
          <ShimmerPlaceholder
            style={{ width: "60%", borderRadius: 6, height: 18 }}
          />
          <View className="bg-gray-100 rounded-2xl px-4 py-5 space-y-3">
            <ShimmerPlaceholder
              style={{ width: "100%", borderRadius: 6, height: 14 }}
            />
            <ShimmerPlaceholder
              style={{
                width: "100%",
                height: 14,
                borderRadius: 6,
                marginTop: 10,
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>

    {/* Bottom Button */}
    <View className="absolute bottom-2 left-0 right-0 px-5 py-2">
      <ShimmerPlaceholder
        style={{ width: "100%", height: 56, borderRadius: 10 }}
      />
    </View>
  </View>
);

export default CustomerBookingDetailsSkeleton;
