import { View, Text, Pressable } from "react-native";
import React from "react";

const ProfileLogoutBtn = ({onPress}) => {
  return (
    <Pressable className="p-2 mt-7 mb-10" onPress={onPress}>
      <Text className="text-lg text-primary font-psemibold text-center">
        Logout
      </Text>
    </Pressable>
  );
};

export default ProfileLogoutBtn;
