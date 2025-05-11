import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../components/ui/TabHeader";
import { icons } from "../../../constants";
import { colors } from "../../../constants/colors";
import Dropdown from "../../../components/ui/Dropdown";
import { useRouter } from "expo-router";

const CustomerBookings = () => {
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
      {/* Header */}
      <TabHeader title="Bookings" />

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
            {[...Array(10)].map((_, index) => (
              <BookingItem key={index} item={_} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const BookingItem = ({ item }) => {
  const router = useRouter();

  return (
    <Pressable
      className="p-4 rounded-2xl border-2 border-gray-300"
      onPress={() => {
        router.push(`/customer/bookings/${"item._id"}`);
      }}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="p-4 bg-muted-100 rounded-2xl items-center justify-center">
          <Image
            source={icons.acRepair}
            tintColor={colors.primary}
            className="h-16 w-16"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="p-2 bg-red-100 rounded-xl">
              <Text className="text-sm font-psemibold text-red-600">
                Pending
              </Text>
            </View>
            <Text className="text-text font-psemibold text-lg">&#35;2</Text>
          </View>
          <Text className="text-primary font-psemibold text-xl mt-2">
            AC Repair
          </Text>
          <Text className="text-text font-psemibold text-lg mt-2">Rs 1400</Text>
        </View>
      </View>
      <View className="bg-gray-100 p-4 rounded-2xl gap-2 mt-4">
        {[
          {
            label: "Date & Time",
            value: `25 Apr, 2025 At 12:00`,
          },
          { label: "Provider", value: "Provider Name" },
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
      </View>
    </Pressable>
  );
};

export default CustomerBookings;
