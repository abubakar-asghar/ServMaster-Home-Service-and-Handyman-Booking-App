import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const CustomerHomeSkeleton = () => {
  return (
    <View>
      <Text>CustomerHomeSkeleton</Text>
    </View>
  );
};

export default CustomerHomeSkeleton;
