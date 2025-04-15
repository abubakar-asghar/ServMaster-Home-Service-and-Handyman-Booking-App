import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../../constants";
import { colors } from "../../constants/colors";

const FormField = ({
  title,
  value,
  placeholder,
  icon,
  handleChangeText,
  otherStyles,
  secureTextEntry,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title && (
        <Text className="text-base text-text font-pmedium">{title}</Text>
      )}

      <View className="w-full h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center">
        {icon && (
          <View className="flex-row items-center gap-4 mr-3">
            <Image
              source={icon}
              className="w-5 h-5"
              resizeMode="contain"
              tintColor={colors.primary}
            />
            <View className="w-[1px] h-10 bg-gray-300" />
          </View>
        )}

        <TextInput
          className="flex-1 text-text font-psemibold text-base"
          style={{ includeFontPadding: false }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={icon && colors.text}
          onChangeText={handleChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
