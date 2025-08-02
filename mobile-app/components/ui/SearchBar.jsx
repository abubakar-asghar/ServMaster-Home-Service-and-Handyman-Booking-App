import { View, TextInput, Image } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
  disabled,
}) => {
  return (
    <View className="flex-1 flex-row min-h-[56px] bg-muted-light rounded-xl shadow-md shadow-primary justify-center items-center px-5">
      <View className="h-6 w-6 items-center justify-center">
        <Feather name="search" size={20} color="#9CA3AF" />
      </View>
      <TextInput
        className="flex-1 ml-4 text-text font-pmedium"
        style={{ includeFontPadding: false }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        autoCapitalize="none"
        editable={!disabled}
      />
    </View>
  );
};

export default SearchBar;
