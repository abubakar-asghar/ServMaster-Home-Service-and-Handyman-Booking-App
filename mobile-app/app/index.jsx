import React from "react";
import { View, Text, Button, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ScrollView>
        <Text>Welcome to ServMaster!</Text>
        <TouchableOpacity>
          <Link href={"/auth/login"}>Go to Login page</Link>
          <Link href={"/customer/home"}>Go to Customer's page</Link>
          <Link href={"/provider/home"}>Go to Provider's page</Link>
          <Link href={"/onboarding/step1"}>Go to Onboarding page</Link>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
