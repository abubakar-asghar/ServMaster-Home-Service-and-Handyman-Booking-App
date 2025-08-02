import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const CustomDropdown = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select an option",
  iconColor = colors.primary,
}) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before any state updates
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label || placeholder;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className={`flex-row justify-between items-center px-4 py-3 ${
        selectedValue === item.value ? "bg-primary-50" : ""
      }`}
      onPress={() => {
        if (!mounted) return;
        onValueChange(item.value);
        setVisible(false);
      }}
    >
      <Text
        className={`text-gray-800 font-pmedium ${
          selectedValue === item.value ? "text-primary" : ""
        }`}
      >
        {item.label}
      </Text>
      {selectedValue === item.value && (
        <Feather name="check" size={18} color={iconColor} />
      )}
    </TouchableOpacity>
  );

  if (!mounted) {
    return (
      <View className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white">
        <Text className="text-gray-400 font-pmedium">{placeholder}</Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      {/* Dropdown Trigger Button */}
      <TouchableOpacity
        className="w-full h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center"
        onPress={() => {
          if (!mounted) return;
          setVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Text
          className={`flex-1 font-pmedium text-base mr-2 ${
            selectedValue ? "text-text" : "text-gray-400"
          }`}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Feather
          name={visible ? "chevron-up" : "chevron-down"}
          size={18}
          color={iconColor}
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={visible && mounted}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!mounted) return;
          setVisible(false);
        }}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center px-5"
          activeOpacity={1}
          onPress={() => {
            if (!mounted) return;
            setVisible(false);
          }}
        >
          <View
            className="bg-white rounded-2xl py-2"
            style={[
              Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                  }
                : {
                    elevation: 5,
                  },
              { maxHeight: 260 },
            ]}
          >
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-gray-200 mx-4" />
              )}
              keyboardShouldPersistTaps="always"
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;
