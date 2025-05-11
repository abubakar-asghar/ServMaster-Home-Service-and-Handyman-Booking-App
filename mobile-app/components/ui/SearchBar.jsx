import { View, TextInput, Image } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const SearchBar = ({ value, onChangeText, placeholder = "Search..." }) => {
  return (
    <View className="flex-1 flex-row min-h-[56px] bg-muted-100 rounded-xl justify-center items-center px-5">
      <Feather
        name="search"
        size={20}
        color="#9CA3AF"
        style={{ marginRight: 8 }}
      />
      <TextInput
        className="flex-1 text-text font-pmedium"
        style={{ includeFontPadding: false }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        placeho
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
};

export default SearchBar;
