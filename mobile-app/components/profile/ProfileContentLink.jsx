import { Image, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import { icons } from "../../constants";
import { router } from "expo-router";

const ProfileContentLink = ({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center px-5 py-5"
      onPress={() => {
        item.route && router.push(item.route);
      }}
    >
      <View className="flex-row items-center">
        <Image
          source={item.icon}
          className="w-5 h-5 mr-4"
          tintColor={colors.primary}
        />
        <Text className="text-base text-text font-pmedium">{item.label}</Text>
      </View>
      <View className="flex-row items-center ml-auto gap-2">
        {item.status && (
          <Text
            className={`text-sm ${
              item.status === "Verified" ? "text-success" : "text-error"
            } font-pregular`}
          >
            {item.status}
          </Text>
        )}
        <Image
          source={icons.back}
          className="w-5 h-5 ml-auto rotate-180"
          tintColor={colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileContentLink;
