import { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import { colors } from "../../constants/colors";
import { icons } from "../../constants";

const PhoneInput = ({
  value,
  onChange,
  error,
  otherStyles,
  style,
  title = "Phone Number",
}) => {
  const [formattedValue, setFormattedValue] = useState(value);

  const handlePhoneChange = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Max 10 digits after +92
    if (cleaned.length > 10) return;

    setFormattedValue(cleaned);
    onChange(cleaned);
  };

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title && (
        <Text className="text-base text-text font-pmedium">{title}</Text>
      )}

      <View
        className="w-full h-16 px-5 bg-black-100 rounded-2xl border-2 flex flex-row items-center"
        style={[
          style,
          {
            borderColor: error ? "red" : colors.gray300,
          },
        ]}
      >
        <Text className="text-base text-muted font-pmedium pr-2">+92</Text>

        <TextInput
          className="flex-1 text-text font-pmedium text-base"
          style={{ includeFontPadding: false }}
          value={formattedValue}
          placeholder="3001234567"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          maxLength={10}
          onChangeText={handlePhoneChange}
        />

        <View className="items-center ml-4">
          <Image
            source={icons.call}
            className="w-5 h-5"
            resizeMode="contain"
            tintColor={colors.primary}
          />
        </View>
      </View>

      {error && (
        <Text className="text-red-500 text-sm font-pregular">{error}</Text>
      )}
    </View>
  );
};

export default PhoneInput;
