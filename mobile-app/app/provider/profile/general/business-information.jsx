import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { icons } from "../../../../constants";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useUpdateProviderBusinessInfo } from "../../../../hooks/useProvider";

const ProviderBusinessInfo = () => {
  const router = useRouter();

  const [errors, setErrors] = useState({});

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("User", user);
  }, []);

  const { mutateAsync: updateProviderBusinessInfo, isPending } =
    useUpdateProviderBusinessInfo();

  const [formData, setFormData] = useState({
    profileImage: user?.businessInfo?.profileImage || null,
    type: user?.businessInfo?.type || "individual",
    name: user?.businessInfo?.name || "",
    description: user?.businessInfo?.description || "",
    address: user?.businessInfo?.address || "",
    city: user?.businessInfo?.city || "",
    hasPhysicalShop: user?.businessInfo?.hasPhysicalShop || null,
    workingDays: user?.businessInfo?.workingDays || [],
    workingHours: {
      startTime: user?.businessInfo?.workingHours?.startTime || "",
      endTime: user?.businessInfo?.workingHours?.endTime || "",
    },
  });

  const [isStartTimeModalVisible, setStartTimeModalVisible] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(
    formData.workingHours.startTime || ""
  );
  const [isEndTimeModalVisible, setEndTimeModalVisible] = useState(false);
  const [selectedEndTime, setSelectedEndTime] = useState(
    formData.workingHours.endTime || ""
  );

  const timeSlots = [
    "06:00 AM",
    "07:00 AM",
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
  ];

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

  const handleSelectStartTime = (time) => {
    setSelectedStartTime(time);
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        startTime: time,
      },
    }));
    setStartTimeModalVisible(false);
  };

  const timeToMinutes = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const getFilteredEndTimes = () => {
    const startTimeInMinutes = timeToMinutes(
      formData.workingHours.startTime || "06:00 AM"
    );

    return timeSlots.filter((time) => timeToMinutes(time) > startTimeInMinutes);
  };

  const handleSelectEndTime = (time) => {
    setSelectedEndTime(time);
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        endTime: time,
      },
    }));
    setEndTimeModalVisible(false);
  };

  // Validation
  // const validateForm = () => {
  //   const newErrors = {};

  //   if (!formData.fullName.trim()) {
  //     newErrors.fullName = "Full name is required.";
  //   }

  //   if (formData.whatsapp && !/^\d{11}$/.test(formData.whatsapp)) {
  //     newErrors.whatsapp = "Phone number must be exactly 11 digits.";
  //   } else if (formData.whatsapp && !/^03\d{9}$/.test(formData.whatsapp)) {
  //     newErrors.whatsapp = "Phone number must start with 03.";
  //   }

  //   if (
  //     formData.email &&
  //     !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
  //   ) {
  //     newErrors.email = "Please enter a valid email address.";
  //   }

  //   setErrors(newErrors);

  //   return Object.keys(newErrors).length === 0;
  // };

  // Set undefined for empty or null fields
  const sanitizeFormData = (data) => {
    const sanitizedData = { ...data };

    for (const key in sanitizedData) {
      if (sanitizedData[key] === "" || sanitizedData[key] === null) {
        sanitizedData[key] = undefined;
      }
    }

    return sanitizedData;
  };

  const handleUpdateBusinessInfo = async () => {
    // Handle the update logic here
    console.log("Business Info Updated", formData);

    try {
      const sanitizedData = sanitizeFormData(formData);
      console.log("Sanitized Data:", sanitizedData);
      const response = await updateProviderBusinessInfo(sanitizedData);

      if (!response.success) {
        console.log(response.message || "Updation failed. Please try again.");
      }
    } catch (error) {
      console.log("An error occurred. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      {/* Header */}
      <TabHeader title={"Business Information"} goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5 w-full">
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

          {/* Working Days */}
          <View>
            <Text className="text-base text-text font-pmedium">
              Select Working Days
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
                    className={`text-center text-sm font-pregular ${
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

          {/* Working Hours */}
          <View className="mt-5">
            <Text className="text-base text-text font-pmedium">
              Select Working Hours
            </Text>
            <View className="w-full flex-row items-end justify-between mt-3 gap-4">
              <Pressable
                className="flex-1 h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center"
                onPress={() => setStartTimeModalVisible(true)}
              >
                <Text className="flex-1 text-text font-pmedium text-base">
                  {formData.workingHours.startTime || "Select Start Time"}
                </Text>
              </Pressable>
              {/* <View className="items-center justify-center gap-1">
                <Pressable className="py-[2px] border-2 border-gray-300 w-20 rounded-xl items-center justify-center">
                  <Text className="text-sm text-text font-pmedium">AM</Text>
                </Pressable>
                <Pressable className="py-[2px] border-2 border-gray-300 w-20 rounded-xl items-center justify-center">
                  <Text className="text-sm text-text font-pmedium">PM</Text>
                </Pressable>
              </View> */}
            </View>
            <View className="w-full flex-row items-end justify-between mt-3 gap-4">
              <Pressable
                className="flex-1 h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center"
                onPress={() => setEndTimeModalVisible(true)}
              >
                <Text className="flex-1 text-text font-pmedium text-base">
                  {formData.workingHours.endTime || "Select End Time"}
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
          handlePress={handleUpdateBusinessInfo}
          containerStyles={"bg-primary w-[48%]"}
          isLoading={isPending}
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isStartTimeModalVisible}
        onRequestClose={() => setStartTimeModalVisible(false)}
      >
        <View className="flex-1 justify-center px-5 bg-transparent bg-opacity-50">
          <View
            className="bg-white p-10 max-h-[60%] rounded-3xl"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text className="text-lg font-psemibold text-center mb-4">
              Select Start Time
            </Text>
            <ScrollView className="max-h-[300px]">
              {timeSlots.map((time) => (
                <Pressable
                  key={time}
                  className="py-3 px-4 border-b border-gray-200"
                  onPress={() => handleSelectStartTime(time)}
                >
                  <Text className="text-base text-text text-center">
                    {time}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <CustomButton
              title="Cancel"
              handlePress={() => setStartTimeModalVisible(false)}
              containerStyles="mt-5 bg-secondary"
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isEndTimeModalVisible}
        onRequestClose={() => setEndTimeModalVisible(false)}
      >
        <View className="flex-1 justify-center px-5 bg-transparent bg-opacity-50">
          <View
            className="bg-white p-10 max-h-[60%] rounded-3xl"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text className="text-lg font-psemibold text-center mb-4">
              Select End Time
            </Text>
            <ScrollView className="max-h-[300px]">
              {getFilteredEndTimes().map((time) => (
                <Pressable
                  key={time}
                  className="py-3 px-4 border-b border-gray-200"
                  onPress={() => handleSelectEndTime(time)}
                >
                  <Text className="text-base text-text text-center">
                    {time}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <CustomButton
              title="Cancel"
              handlePress={() => setEndTimeModalVisible(false)}
              containerStyles="mt-5 bg-secondary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProviderBusinessInfo;
