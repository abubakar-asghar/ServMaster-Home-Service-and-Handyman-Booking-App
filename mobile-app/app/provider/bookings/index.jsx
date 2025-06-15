import { View, Text, ScrollView, Pressable, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../components/ui/TabHeader";
import Dropdown from "../../../components/ui/Dropdown";
import CustomButton from "../../../components/ui/CustomButton";
import { icons } from "../../../constants";
import { colors } from "../../../constants/colors";

const ProviderBookings = () => {
  const [bookingStatus, setBookingStatus] = useState("All");

  const statusData = [
    { key: "1", value: "All" },
    { key: "2", value: "Pending" },
    { key: "3", value: "Accepted" },
    { key: "4", value: "On Going" },
    { key: "5", value: "In Progress" },
    { key: "6", value: "Hold" },
    { key: "7", value: "Cancelled" },
    { key: "8", value: "Rejected" },
    { key: "9", value: "Failed" },
    { key: "10", value: "Completed" },
    { key: "11", value: "Pending Approval" },
    { key: "12", value: "Waiting" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TabHeader title={"Bookings"} />

      <View className="w-full px-5 py-2 mt-3 bg-white">
        {/* Select Status */}
        <Dropdown
          placeholder="Select Booking Status"
          defaultValue={bookingStatus}
          data={statusData}
          onChange={setBookingStatus}
          containerStyles=""
          dropdownHeight={"max-content"}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative flex-1 bg-white p-5">
          <View className="gap-4">
            {[
              {
                _id: 1,
                service: "Home Cleaning",
                icon: icons.cleaning,
                price: 1400,
                status: "Pending",
                address: "Kaleem Shaheed Colony",
                date: "24 Apr, 2025",
                time: "12:00",
                customer: "Abubakar",
              },
              {
                _id: 2,
                service: "Gardening Service",
                icon: icons.gardening,
                price: 1400,
                status: "Pending",
                address: "Kaleem Shaheed Colony",
                date: "24 Apr, 2025",
                time: "12:00",
                customer: "Abubakar",
              },
              {
                _id: 3,
                service: "AC Repair",
                icon: icons.acRepair,
                price: 1400,
                status: "Pending",
                address: "Kaleem Shaheed Colony",
                date: "24 Apr, 2025",
                time: "12:00",
                customer: "Abubakar",
              },
            ].map((item) => (
              <BookingItem key={item._id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const BookingItem = ({ item }) => {
  return (
    <Pressable className="p-4 rounded-2xl border-2 border-gray-300">
      <View className="flex-row items-start justify-between gap-4">
        <View className="p-4 bg-muted-100 rounded-2xl items-center justify-center">
          <Image
            source={item.icon}
            tintColor={colors.primary}
            className="h-16 w-16"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="p-2 bg-red-100 rounded-xl">
              <Text className="text-sm font-psemibold text-red-600">
                {item.status}
              </Text>
            </View>
            <Text className="text-text font-psemibold text-lg">
              &#35;{item._id}
            </Text>
          </View>
          <Text className="text-primary font-psemibold text-xl mt-2">
            {item.service}
          </Text>
          <Text className="text-text font-psemibold text-lg mt-2">
            Rs {item.price}
          </Text>
        </View>
      </View>
      <View className="bg-gray-100 p-4 rounded-2xl gap-2 mt-4">
        {[
          { label: "Address", value: item.address },
          {
            label: "Date & Time",
            value: `${item.date} At ${item.time}`,
          },
          { label: "Customer", value: item.customer },
        ].map((data, idx) => (
          <View
            key={data.value}
            className={`flex-row items-center justify-between py-2 ${
              idx !== 0 ? "border-t border-gray-300" : ""
            }`}
          >
            <Text className="text-muted font-psemibold text-base">
              {data.label}
            </Text>
            <Text className="text-text font-psemibold text-base">
              {data.value}
            </Text>
          </View>
        ))}
        <View className="flex-row items-center justify-between mt-2">
          <CustomButton
            title={"Accept"}
            handlePress={() => {}}
            containerStyles={"bg-primary w-[48%]"}
          />
          <CustomButton
            title={"Decline"}
            handlePress={() => {}}
            containerStyles={"bg-background w-[48%]"}
            textStyles={"text-primary"}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default ProviderBookings;
