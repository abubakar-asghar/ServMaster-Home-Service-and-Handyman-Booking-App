import { View, Text } from "react-native";

export default function Stepper({ currentStep = 1 }) {
  return (
    <View className="flex-row justify-center items-center my-5">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-14 h-14 rounded-full justify-center items-center ${
              currentStep >= step ? "bg-primary" : "bg-gray-100"
            }`}
            style={{
              shadowColor: currentStep >= step ? "#3b82f6" : "#9ca3af",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <Text
              className={`${
                currentStep >= step ? "text-white" : "text-gray-500"
              } font-bold text-lg`}
            >
              {step}
            </Text>
          </View>
          {step !== 3 && (
            <View
              className={`w-10 h-1 mx-2 ${
                currentStep > step ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );
}
