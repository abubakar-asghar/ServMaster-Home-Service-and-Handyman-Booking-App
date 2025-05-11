import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SelectRole() {
  const router = useRouter();

  const handleSelection = async (role) => {
    try {
      await AsyncStorage.setItem("onboarding_done", "true");
      await AsyncStorage.setItem("user_role", role);

      if (role === "customer") {
        router.push("/auth/customer-register");
      } else if (role === "provider") {
        router.push("/auth/provider-register");
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center bg-white px-6">
      <View className="flex-row gap-2 mt-16 mb-8">
        <Text className="text-2xl font-psemibold text-center text-black">
          I want to
        </Text>
        <Text className="text-3xl font-pextrabold text-center text-primary">
          Sign Up
        </Text>
        <Text className="text-2xl font-psemibold text-center text-black">
          as
        </Text>
      </View>

      <CustomButton
        title="Customer"
        handlePress={() => handleSelection("customer")}
        textStyles="text-white"
        containerStyles="bg-primary w-[300px]"
      />

      <CustomButton
        title="Service Provider"
        handlePress={() => handleSelection("provider")}
        textStyles="text-white"
        containerStyles="bg-primary w-[300px] mt-4"
      />
    </SafeAreaView>
  );
}
