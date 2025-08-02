import React from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { customerRoutes, providerRoutes } from "../../lib/routes";

export default function SelectRole() {
  const handleSelection = async (role) => {
    try {
      await AsyncStorage.setItem("onboarding_done", "true");
      await AsyncStorage.setItem("user_role", role);

      if (role === "Customer") {
        router.push(customerRoutes.CUSTOMER_REGISTER);
      } else if (role === "ServiceProvider") {
        router.push(providerRoutes.PROVIDER_REGISTER);
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
        handlePress={() => handleSelection("Customer")}
        textStyles="text-white"
        containerStyles="bg-primary w-[300px]"
      />

      <CustomButton
        title="Service Provider"
        handlePress={() => handleSelection("ServiceProvider")}
        textStyles="text-white"
        containerStyles="bg-primary w-[300px] mt-4"
      />
    </SafeAreaView>
  );
}
