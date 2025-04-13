import React from "react";
import { Text } from "react-native";
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
        router.replace("/auth/customer-register");
      } else if (role === "provider") {
        router.replace("/auth/provider-register");
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-psemibold text-center text-black mb-8">
        Choose Your Role
      </Text>

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
