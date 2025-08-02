import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { images } from "../../constants";
import { colors } from "../../constants/colors";
import React from "react";

const CustomButton = ({
  title,
  handlePress,
  icon,
  containerStyles,
  textStyles,
  style,
  isLoading,
  tintColor,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`rounded-xl min-h-[56px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading || disabled ? "opacity-50" : ""
      }`}
      disabled={isLoading || disabled}
      style={style}
    >
      {icon &&
        (React.isValidElement(icon) ? (
          <View className={`w-6 h-6 ${title && "mr-3"}`}>{icon}</View>
        ) : (
          <Image
            source={icon}
            className={`w-5 h-5 ${title && "mr-3"}`}
            tintColor={
              tintColor === false
                ? undefined
                : textStyles?.includes("text-text")
                ? colors.text
                : textStyles?.includes("text-primary")
                ? colors.primary
                : "white"
            }
            resizeMode="contain"
          />
        ))}

      {title && (
        <Text
          className={`${
            textStyles?.includes("text-text") ||
            textStyles?.includes("text-primary") ||
            textStyles?.includes("text-red-600") ||
            textStyles?.includes("text-gray-700") ||
            textStyles?.includes("text-success")
              ? ""
              : "text-white"
          } font-psemibold text-lg ${textStyles}`}
        >
          {title}
        </Text>
      )}

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
