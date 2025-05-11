import { View, Text, ScrollView, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import { icons } from "../../../../constants";
import { colors } from "../../../../constants/colors";
import CustomButton from "../../../../components/ui/CustomButton";

const InfoRow = ({ label, value, showBorder = false }) => (
  <View
    className={`flex-row items-center py-1 gap-2 ${
      showBorder ? "border-t border-gray-300" : ""
    }`}
  >
    <Text className="text-muted font-psemibold text-base">{label}:</Text>
    <Text className="text-text font-psemibold text-base">{value}</Text>
  </View>
);

const Heading = ({ heading }) => (
  <Text className="font-psemibold text-text text-lg mt-6">{heading}</Text>
);

const PriceRow = ({ label, value, showBorder = false }) => (
  <View
    className={`flex-row items-center justify-between py-2 ${
      showBorder ? "border-t border-t-gray-300" : ""
    }`}
  >
    <Text className="text-muted text-base font-pmedium">{label}</Text>
    <Text className="text-primary text-base font-psemibold">{value}</Text>
  </View>
);

const BookingDetail = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="In Progress" goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Booking Heading and ID */}
          <View className="flex-row items-center justify-between pb-4 border-b border-gray-200">
            <Text className="text-muted font-psemibold text-xl">
              Booking ID
            </Text>
            <Text className="text-primary font-psemibold text-xl">#2</Text>
          </View>

          {/* Service Info */}
          <View className="flex-row items-center justify-between gap-4 mt-5">
            <View className="flex-1">
              <Text className="text-primary font-psemibold text-xl mb-1">
                AC Repair
              </Text>
              <InfoRow label="Date" value="25 Apr, 2025" />
              <InfoRow label="Time" value="12:00" />
            </View>
            <View className="p-4 bg-muted-100 rounded-2xl items-center justify-center">
              <Image
                source={icons.acRepair}
                tintColor={colors.primary}
                className="h-16 w-16"
              />
            </View>
          </View>

          {/* Description */}
          <Heading heading={"Booking Description"} />
          <Text className="text-muted text-base font-psemibold mt-2">
            Hello i want to clean AC kit
          </Text>

          {/* About Handyman */}
          <Heading heading={"About Handyman"} />
          <View className="p-5 bg-gray-100 rounded-2xl mt-4">
            <View className="flex-row items-center gap-4 pb-5 border-b border-gray-200">
              <View className="items-center justify-center p-5 bg-primary rounded-full">
                <Image
                  source={icons.services}
                  tintColor={colors.background}
                  className="w-10 h-10"
                />
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-primary font-psemibold text-lg">
                    Provider Name
                  </Text>
                  <Image
                    source={icons.info}
                    tintColor={colors.primary}
                    className="w-5 h-5"
                  />
                </View>
                <View className="flex-row items-center gap-1 mt-1">
                  {[...Array(5)].map((_, idx) => (
                    <Image
                      key={idx}
                      source={icons.star}
                      tintColor={"yellow"}
                      className="w-5 h-5"
                    />
                  ))}
                </View>
              </View>
            </View>
            <View className="mt-5 flex-row items-center justify-between">
              <CustomButton
                title="Call"
                icon={icons.call}
                handlePress={() => {}}
                containerStyles="bg-primary w-[30%]"
              />
              <CustomButton
                title="Chat"
                icon={icons.chat}
                handlePress={() => {}}
                containerStyles="bg-white w-[30%]"
                textStyles="text-text"
              />
              <CustomButton
                icon={icons.whatsapp}
                tintColor={false}
                handlePress={() => {}}
                containerStyles="bg-white w-[30%]"
                textStyles="text-text"
              />
            </View>
          </View>

          {/* About Provider */}
          <Heading heading={"About Provider"} />
          <View className="p-5 flex-row items-center bg-gray-100 rounded-2xl mt-4 gap-4">
            <View className="items-center justify-center p-4 bg-primary rounded-full">
              <Image
                source={icons.services}
                tintColor={colors.background}
                className="w-10 h-10"
              />
            </View>
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-primary font-psemibold text-lg">
                  Provider Name
                </Text>
                <Image
                  source={icons.info}
                  tintColor={colors.primary}
                  className="w-5 h-5"
                />
              </View>
              <View className="flex-row items-center gap-1 mt-1">
                {[...Array(5)].map((_, idx) => (
                  <Image
                    key={idx}
                    source={icons.star}
                    tintColor={"yellow"}
                    className="w-5 h-5"
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Price Detail */}
          <Heading heading={"Price Detail"} />
          <View className="p-4 rounded-2xl bg-gray-100 mt-4">
            <PriceRow label="Price" value="Rs 1400" />
            <PriceRow label="Total Amount" value="Rs 1400" showBorder />
          </View>
        </View>
      </ScrollView>
      {/* Buttons */}
      <View className="absolute bottom-2 left-0 right-0 px-5 py-2 flex-row items-center justify-between bg">
        <CustomButton
          title="Cancel Booking"
          handlePress={() => {}}
          containerStyles="bg-secondary w-full"
        />
      </View>
    </SafeAreaView>
  );
};

export default BookingDetail;
