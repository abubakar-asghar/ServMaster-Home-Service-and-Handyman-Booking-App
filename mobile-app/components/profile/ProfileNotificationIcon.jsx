import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { icons } from "../../constants";
import { colors } from "../../constants/colors";
import { router } from "expo-router";

const ProfileNotificationIcon = ({to}) => {
  return (
    <TouchableOpacity
      className="absolute top-5 right-5 p-3 bg-white rounded-full shadow-lg border border-primary"
      style={{ elevation: 5 }}
      activeOpacity={0.7}
      onPress={() => router.push(to)}
    >
      <Image
        source={icons.bellFill}
        className="w-5 h-5"
        tintColor={colors.primary}
      />
    </TouchableOpacity>
  );
};

export default ProfileNotificationIcon;
