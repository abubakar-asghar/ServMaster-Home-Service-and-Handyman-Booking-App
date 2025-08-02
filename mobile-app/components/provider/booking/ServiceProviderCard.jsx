import { View, Text, Image, Rating, TouchableOpacity } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons"; // For icon usage (e.g., call button)
import { icons } from "../../../constants";
import CustomButton from "../../ui/CustomButton";
import { useRouter } from "expo-router";

const ServiceProviderCard = ({ provider, service }) => {
  const router = useRouter();

  return (
    <View className="bg-white rounded-lg shadow-md mb-4 p-4">
      {/* Profile Image */}
      <View className="flex-row items-center mb-4">
        <Image source={icons.profile} className="w-16 h-16 rounded-full mr-4" />
        <View>
          <Text className="text-xl font-semibold">{provider.fullName}</Text>
          <Text className="text-sm text-gray-500">
            {provider.businessInfo.name || "No business name"}
          </Text>
        </View>
      </View>

      {/* Account Status */}
      <Text
        className={`text-sm font-medium ${
          provider.accountStatus === "active"
            ? "text-green-500"
            : provider.accountStatus === "verified"
            ? "text-blue-500"
            : provider.accountStatus === "suspended"
            ? "text-red-500"
            : "text-yellow-500"
        }`}
      >
        {provider.accountStatus === "active"
          ? "Active"
          : provider.accountStatus === "verified"
          ? "Verified"
          : provider.accountStatus === "suspended"
          ? "Suspended"
          : "Pending"}
      </Text>

      {/* Rating */}
      <View className="flex-row items-center mt-2">
        <FontAwesome name="star" size={16} color="#FFD700" />
        <Text className="ml-1 text-sm font-semibold">
          {provider.rating.average ? provider.rating.average : "N/A"} (
          {provider.rating.count} reviews)
        </Text>
      </View>

      {/* Business Info */}
      {provider.businessInfo.description && (
        <Text className="text-sm text-gray-700 mt-2">
          {provider.businessInfo.description.length > 100
            ? provider.businessInfo.description.slice(0, 100) + "..."
            : provider.businessInfo.description}
        </Text>
      )}

      {/* Contact Info - Call or WhatsApp */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity className="flex-row items-center bg-blue-500 p-2 rounded-md">
          <FontAwesome name="phone" size={18} color="white" />
          <Text className="ml-2 text-white">Call</Text>
        </TouchableOpacity>

        {provider.personalInfo.whatsapp && (
          <TouchableOpacity className="flex-row items-center bg-green-500 p-2 rounded-md">
            <FontAwesome name="whatsapp" size={18} color="white" />
            <Text className="ml-2 text-white">WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>

      <View>
        <CustomButton
          title="Book Now"
          onPress={router.push(
            `/customer/bookings/${provider.id + "-" + service}/book`
          )}
          containerStyles="mt-4 bg-primary"
        />
      </View>
    </View>
  );
};

export default ServiceProviderCard;
