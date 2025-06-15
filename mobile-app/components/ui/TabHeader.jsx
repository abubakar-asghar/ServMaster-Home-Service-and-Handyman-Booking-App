import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { icons } from "../../constants";
import { useRouter } from "expo-router";

const TabHeader = ({ title, goBack }) => {
  const router = useRouter();
  return (
    <View
      className="px-5 w-full flex-row items-center justify-start bg-primary"
      style={{ paddingVertical: 15 }}
    >
      {goBack && (
        <TouchableOpacity onPress={() => router.back()} className="flex items-center justify-center rounded-full" style={{marginRight: 24}}>
          <Image
            source={icons.back}
            resizeMode="contain"
            className="w-7 h-7"
            tintColor="white"
          />
        </TouchableOpacity>
      )}
      <Text className="text-2xl text-center text-white font-pmedium">
        {title}
      </Text>
    </View>
  );
};

export default TabHeader;
