import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { icons } from "../../constants";
import { useRouter } from "expo-router";
import { useNavigationHistory } from "../../hooks/useNavigationHistory";

const TabHeader = ({ title, goBack, rightAction }) => {
  const router = useRouter();
  const { back, push } = useNavigationHistory();

  const handleBack = () => {
    if (typeof goBack === "string") {
      // If a specific back path is provided
      router.replace(goBack);
    } else {
      // Use our custom back handler
      back();
    }
  };

  return (
    <View
      className="px-5 w-full flex-row items-center justify-between bg-primary"
      style={{ paddingVertical: 15 }}
    >
      <View className="flex-row items-center flex-1">
        {goBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="flex items-center justify-center rounded-full"
            style={{ marginRight: 16 }}
            activeOpacity={0.7}
          >
            <Image
              source={icons.back}
              resizeMode="contain"
              className="w-6 h-6"
              tintColor="white"
            />
          </TouchableOpacity>
        )}
        <Text className="text-2xl text-white font-pmedium flex-1">{title}</Text>
      </View>

      {rightAction && <View className="ml-4">{rightAction}</View>}
    </View>
  );
};

export default TabHeader;
