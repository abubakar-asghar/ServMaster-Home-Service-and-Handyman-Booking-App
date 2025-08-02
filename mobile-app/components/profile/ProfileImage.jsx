import { useState } from "react";
import { Image, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const ProfileImage = ({ image, className = "", defaultIconSize = 24 }) => {
  const [imageError, setImageError] = useState(false);

  // Default classes if none provided
  const defaultClasses = "w-14 h-14 rounded-full border-2 border-primary";

  // Combine default and custom classes
  const containerClasses = `${defaultClasses} ${className}`;

  return (
    <View className={containerClasses}>
      {image && !imageError ? (
        <Image
          source={{ uri: image }}
          className="w-full h-full rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="flex-1 items-center justify-center bg-white rounded-full">
          <Feather name="user" size={defaultIconSize} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default ProfileImage;
