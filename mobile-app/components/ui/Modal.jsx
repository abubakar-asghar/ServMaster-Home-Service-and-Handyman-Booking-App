import { View, Text, Modal as RNModal, TouchableOpacity } from "react-native";

export default function Modal({ visible, onClose, title, children }) {
  return (
    <RNModal transparent visible={visible} animationType="slide">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="w-4/5 bg-white p-6 rounded-lg">
          <Text className="text-lg font-bold text-text">{title}</Text>
          {children}
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-primary py-2 rounded-md"
          >
            <Text className="text-white text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
}
