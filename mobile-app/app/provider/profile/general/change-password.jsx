import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { router } from "expo-router";
import { useUpdateProviderPassword } from "../../../../hooks/useProvider";
import { providerRoutes } from "../../../../lib/routes";

const ProviderChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutateAsync: updatePassword, isPending } =
    useUpdateProviderPassword();

  const handleChangePassword = async () => {
    // Handle the change password logic here
    if (newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match.");
      return;
    }
    try {
      await updatePassword({ newPassword, oldPassword });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader
        title={"Change Password"}
        goBack={providerRoutes.PROVIDER_PROFILE}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5">
          {/* Old Password */}
          <FormField
            title="Old Password"
            placeholder={"Old Password"}
            value={oldPassword}
            handleChangeText={(text) => setOldPassword(text)}
            secureTextEntry
          />

          {/* New Password */}
          <FormField
            title="New Password"
            placeholder={"New Password"}
            value={newPassword}
            handleChangeText={(text) => setNewPassword(text)}
            otherStyles="mt-7"
            secureTextEntry
          />

          {/* Confirm Password */}
          <FormField
            title="Confirm Password"
            placeholder={"Confirm Password"}
            value={confirmPassword}
            handleChangeText={(text) => setConfirmPassword(text)}
            otherStyles="mt-7"
            secureTextEntry
          />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row items-center justify-between p-5 border-t border-t-gray-200">
        <CustomButton
          title={"Go Back"}
          handlePress={() => router.replace(providerRoutes.PROVIDER_PROFILE)}
          containerStyles={"bg-secondary w-[48%]"}
          disabled={isPending}
        />
        <CustomButton
          title={"Update"}
          handlePress={() => handleChangePassword()}
          containerStyles={"bg-primary w-[48%]"}
          isLoading={isPending}
          disabled={isPending}
        />
      </View>
    </View>
  );
};

export default ProviderChangePassword;
