import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

const ProfessionalInformationVerification = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"Professional Information"} goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5">
          {/* Experience */}
          <FormField
            title="Working Experience"
            placeholder="Enter working experience in years"
            icon={null}
            handleChangeText={() => {}}
          />

          {/* Education */}
          <FormField
            title="Education"
            placeholder="Enter Education details"
            icon={null}
            handleChangeText={() => {}}
            otherStyles="mt-5"
          />

          {/* Have Professional Qualification/ Diploma? */}
          <View className="mt-5">
            <Text className="text-base text-text font-pmedium">
              Do you have Professional Qualification / Diploma?
            </Text>
            <View className="flex-row items-center justify-between mt-3">
              <Pressable className="bg-muted-100 rounded-xl p-3 w-[48%]">
                <Text className="text-base text-center text-muted-foreground font-pmedium">
                  Yes
                </Text>
              </Pressable>
              <Pressable className="bg-muted-100 rounded-xl p-3 w-[48%]">
                <Text className="text-base text-center text-muted-foreground font-pmedium">
                  No
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row items-center justify-between p-5 border-t border-t-gray-200">
        <CustomButton
          title={"Go Back"}
          handlePress={() => router.back()}
          containerStyles={"bg-secondary w-[48%]"}
        />
        <CustomButton
          title={"Update"}
          handlePress={() => {}}
          containerStyles={"bg-primary w-[48%]"}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProfessionalInformationVerification;
