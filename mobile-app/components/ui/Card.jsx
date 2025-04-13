import { View, Text } from "react-native";

export default function Card({ title, children }) {
    return (
        <View className="bg-white p-6 rounded-2xl shadow-lg border border-gray-300">
            <Text className="text-xl font-bold text-gray-800 mb-4">{title}</Text>
            <View className="bg-gray-100 p-4 rounded-lg">
                {children}
            </View>
        </View>
    );
}
