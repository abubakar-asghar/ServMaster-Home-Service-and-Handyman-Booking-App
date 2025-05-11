import { ActivityIndicator, Image, Text, TouchableOpacity } from "react-native";
import { images } from "../../constants";
import { colors } from "../../constants/colors";

const CustomButton = ({
  title,
  handlePress,
  icon,
  containerStyles,
  textStyles,
  style,
  isLoading,
  tintColor,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`rounded-xl min-h-[56px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
      style={style}
    >
      {icon && (
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
      )}

      {title && (
        <Text
          className={`${
            textStyles?.includes("text-text") ||
            textStyles?.includes("text-primary")
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
