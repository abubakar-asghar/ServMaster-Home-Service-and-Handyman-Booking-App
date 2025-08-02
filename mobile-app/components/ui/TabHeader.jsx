import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { icons } from "../../constants";
import { useRouter } from "expo-router";
import useNavigationStore from "../../zustand/navigationStore";

const TabHeader = ({ title, goBack }) => {
  const router = useRouter();
  const { previousRoute, clearPreviousRoute, disableBackHandling } =
    useNavigationStore();

  const handleBack = () => {
    if (typeof goBack === "string") {
      router.replace(goBack);
    } else if (previousRoute) {
      router.replace(previousRoute);
      clearPreviousRoute();
      disableBackHandling();
    } else {
      router.back();
    }
  };

  return (
    <View
      className="px-5 w-full flex-row items-center bg-primary"
      style={{ paddingVertical: 15 }}
    >
      {goBack && (
        <TouchableOpacity
          onPress={handleBack}
          className="flex items-center bg-primary justify-center rounded-full"
          style={{ marginRight: 16 }}
        >
          <Image
            source={icons.back}
            resizeMode="contain"
            className="w-6 h-6"
            tintColor="white"
          />
        </TouchableOpacity>
      )}
      <Text className="text-2xl text-white font-pmedium flex-1 text-center">
        {title}
      </Text>
    </View>
  );
};

export default TabHeader;
