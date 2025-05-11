import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { icons } from "../../../../constants";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

const ProviderBusinessInfo = () => {
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    profileImage: user?.profileImage || null,
    type: user?.type || null,
    name: user?.name || "",
    description: user?.description || "",
    address: user?.address || "",
    city: user?.city || "",
    hasPhysicalShop: user?.hasPhysicalShop || null,
    workingDays: user?.workingDays || [],
    workingHours: {
      startTime: user?.workingHours?.startTime || "",
      endTime: user?.workingHours?.endTime || "",
    },
  });

  const handleDays = (day) => {
    if (formData.workingDays.includes(day)) {
      setFormData({
        ...formData,
        workingDays: formData.workingDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        workingDays: [...formData.workingDays, day],
      });
    }
  };

  const handleUpdateBusinessInfo = async () => {
    // Handle the update logic here
    console.log("Business Info Updated", formData);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"Business Information"} goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5">
          {/* Provider Type */}
          <View className="">
            <Text className="text-base text-text font-pmedium">
              I want to use this App as a
            </Text>
            <View className="flex-row items-center justify-between mt-3">
              {[
                { label: "Individual", value: "individual" },
                { label: "Business", value: "business" },
              ].map((item) => (
                <Pressable
                  key={item.value}
                  className={`rounded-xl p-3 w-[48%] ${
                    formData.type === item.value ? "bg-primary" : "bg-muted-100"
                  }`}
                  onPress={() => {
                    setFormData({ ...formData, type: item.value });
                  }}
                >
                  <Text
                    className={`text-base text-center font-pmedium ${
                      formData.type === item.value ? "text-white" : "text-text"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Service / Business Name */}
          <FormField
            title="Service / Business Name"
            placeholder="Enter your Service / Business name"
            icon={null}
            value={formData.name}
            handleChangeText={(value) =>
              setFormData({ ...formData, name: value })
            }
            otherStyles="mt-5"
          />

          {/* Service / Business Type */}
          <FormField
            title="Service / Business Description"
            placeholder="Enter your Service / Business description"
            icon={null}
            value={formData.description}
            handleChangeText={(value) => {
              setFormData({ ...formData, description: value });
            }}
            otherStyles="mt-5"
            multiline
            numberOfLines={3}
            style={{ height: 100, alignItems: "flex-start", paddingTop: 6 }}
          />

          <View className="h-[1px] bg-[#E0E0E0] my-5" />

          {/* Provider Type */}
          <View>
            <Text className="text-base text-text font-pmedium">
              Do you work from Shop / Office
            </Text>
            <View className="flex-row items-center justify-between mt-3">
              {[
                { lable: "Yes", value: true },
                { lable: "No", value: false },
              ].map((item) => (
                <Pressable
                  key={item.lable}
                  className={`rounded-xl p-3 w-[48%] ${
                    formData.hasPhysicalShop === item.value
                      ? "bg-primary"
                      : "bg-muted-100"
                  }`}
                  onPress={() => {
                    setFormData({
                      ...formData,
                      hasPhysicalShop: item.value,
                    });
                  }}
                >
                  <Text
                    className={`text-base text-center font-pmedium ${
                      formData.hasPhysicalShop === item.value
                        ? "text-white"
                        : "text-text"
                    }`}
                  >
                    {item.lable}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Address */}
          <FormField
            title="Address"
            placeholder="Enter your work address"
            icon={null}
            value={formData.address}
            handleChangeText={(value) => {
              setFormData({ ...formData, address: value });
            }}
            otherStyles="mt-5"
          />

          <View className="h-[1px] bg-[#E0E0E0] my-5" />

          {/* Business Days */}
          <View>
            <Text className="text-base text-text font-pmedium">
              Select Business Days
            </Text>
            <View className="flex-row flex-wrap items-center mt-3 gap-2">
              {[
                { label: "Monday", value: "monday" },
                { label: "Tuesday", value: "tuesday" },
                { label: "Wednesday", value: "wednesday" },
                { label: "Thursday", value: "thursday" },
                { label: "Friday", value: "friday" },
                { label: "Saturday", value: "saturday" },
                { label: "Sunday", value: "sunday" },
              ].map((item) => (
                <Pressable
                  key={item.value}
                  className={`rounded-xl py-2 px-3 ${
                    formData.workingDays.includes(item.value)
                      ? "bg-primary"
                      : "bg-muted-100"
                  }`}
                  onPress={() => {
                    handleDays(item.value);
                  }}
                >
                  <Text
                    className={`text-center ${
                      formData.workingDays.includes(item.value)
                        ? "text-white"
                        : "text-text"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Business Hours */}
          <View className="mt-5">
            <Text className="text-base text-text font-pmedium">
              Select Business Hours
            </Text>
            <View className="w-full flex-row items-end justify-between mt-3 gap-4">
              <FormField
                // title="Start Time"
                placeholder="Start time"
                icon={icons.downArrow}
                handleChangeText={() => {}}
                otherStyles="flex-1"
              />
              <View className="items-center justify-center gap-1">
                <Pressable className="py-[2px] border-2 border-gray-300 w-20 rounded-xl items-center justify-center">
                  <Text className="text-sm text-text font-pmedium">AM</Text>
                </Pressable>
                <Pressable className="py-[2px] border-2 border-gray-300 w-20 rounded-xl items-center justify-center">
                  <Text className="text-sm text-text font-pmedium">PM</Text>
                </Pressable>
              </View>
            </View>
            <View>
              <FormField
                // title="End Time"
                placeholder="End time"
                icon={icons.downArrow}
                handleChangeText={() => {}}
                otherStyles="mt-5"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="aboslute b-10 left-0 right-0 items-center justify-between p-5 border-t border-t-gray-200">
        <CustomButton
          title={"Go Back"}
          handlePress={() => router.back()}
          containerStyles={"bg-secondary w-[48%]"}
        />
        <CustomButton
          title={"Update"}
          handlePress={handleUpdateBusinessInfo}
          containerStyles={"bg-primary w-[48%]"}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProviderBusinessInfo;
