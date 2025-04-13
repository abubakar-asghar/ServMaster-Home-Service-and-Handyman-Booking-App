import { View, Text, TouchableOpacity } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <View className="flex-1 items-center justify-center p-5 bg-white">
                <Text className="text-xl font-bold text-gray-800">
                    This screen doesn't exist.
                </Text>
                <Link href="/" asChild>
                    <TouchableOpacity className="mt-4 py-3 px-6 bg-blue-500 rounded">
                        <Text className="text-white font-medium">Go to home screen!</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </>
    );
}
