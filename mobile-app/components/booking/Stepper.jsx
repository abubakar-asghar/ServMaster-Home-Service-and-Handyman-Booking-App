import { View, Text } from "react-native";

export default function Stepper({ currentStep = 1 }) {
  return (
    <View className="flex-row justify-center items-center mb-5">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-full justify-center items-center ${
              currentStep >= step ? "bg-blue-700" : "border border-gray-400"
            }`}
          >
            <Text className="text-white font-bold">{step}</Text>
          </View>
          {step !== 3 && <View className="w-10 h-1 bg-gray-400 mx-2" />}
        </View>
      ))}
    </View>
  );
}
