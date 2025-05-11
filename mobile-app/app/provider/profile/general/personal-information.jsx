import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import Dropdown from "../../../../components/ui/Dropdown";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

const ProviderPersonalInfo = () => {
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    whatsapp: user?.personalInfo?.whatsapp || "",
    email: user?.personalInfo?.email || "",
    gender: user?.personalInfo?.gender || null,
  });

  const handleUpdatePersonalInfo = async () => {
    // Handle the update logic here
    console.log("Personal Info Updated", formData);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"Personal Information"} goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5">
          {/* FullName */}
          <FormField
            title="Full Name"
            placeholder="Enter your full name"
            icon={null}
            value={formData.fullName}
            handleChangeText={(value) => {
              setFormData({ ...formData, fullName: value });
            }}
          />

          {/* Mobile Number */}
          <FormField
            title="Mobile Number"
            placeholder="Enter your mobile number"
            icon={null}
            handleChangeText={() => {}}
            otherStyles="mt-5"
            editable={false}
          />

          {/* Whatsapp Number */}
          <FormField
            title="Whatsapp"
            placeholder="Enter your whatsapp number"
            icon={null}
            value={formData.whatsapp}
            handleChangeText={(value) => {
              setFormData({ ...formData, whatsapp: value });
            }}
            otherStyles="mt-5"
          />

          {/* Email */}
          <FormField
            title="Email"
            placeholder="Enter your email address"
            icon={null}
            value={formData.email}
            handleChangeText={(value) => {
              setFormData({ ...formData, email: value });
            }}
            otherStyles="mt-5"
          />

          {/* Gender Dropdown */}
          <View className="mt-5">
            <Text className="text-base text-text font-pmedium">Gender</Text>
            <Dropdown
              placeholder="Select Gender"
              defaultValue={formData.gender}
              data={[
                { key: "1", value: "Male" },
                { key: "2", value: "Female" },
                { key: "3", value: "Not specified" },
              ]}
              onChange={(value) => setFormData({ ...formData, gender: value })}
            />
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
          handlePress={() => handleUpdatePersonalInfo()}
          containerStyles={"bg-primary w-[48%]"}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProviderPersonalInfo;
