import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import Stepper from "../../../../../components/booking/Stepper";
import { useSelector } from "react-redux";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import TabHeader from "../../../../../components/ui/TabHeader";
import CustomButton from "../../../../../components/ui/CustomButton";
import { icons } from "../../../../../constants";
import { useEffect } from "react";
import { useCreateBookingRequest } from "../../../../../hooks/useBookings";
import { colors } from "../../../../../constants/colors";
import { customerRoutes } from "../../../../../lib/routes";

export default function Step3() {
  const { mutateAsync: createBookingRequest, isPending } =
    useCreateBookingRequest();
  const { bookingInfo, serviceInfo, providerInfo } = useSelector(
    (state) => state.booking
  );

  useEffect(() => {
    console.log("Booking Info:", bookingInfo);
  }, [bookingInfo]);

  const handleConfirm = async () => {
    console.log("hello");
    try {
      const inputDate = new Date(bookingInfo.scheduled_time);
      const formatted = inputDate.toISOString().replace("Z", "+00:00");

      console.log(formatted);
      const data = {
        ...bookingInfo,
        pricing: serviceInfo.pricing,
        scheduled_time: formatted,
        provider_location: providerInfo.coordinates,
      };

      console.log(data);

      await createBookingRequest(data);
      router.replace(customerRoutes.CUSTOMER_BOOKINGS);
    } catch (error) {
      Alert.alert(
        "Booking Error",
        error.message || "An error occurred while processing your booking"
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatAddress = () => {
    if (!bookingInfo.address) return "No address provided";

    let formatted = bookingInfo.address;
    if (bookingInfo.city && formatted.includes(bookingInfo.city)) {
      formatted = formatted.replace(
        new RegExp(`${bookingInfo.city},?`, "g"),
        ""
      );
    }
    if (bookingInfo.state && formatted.includes(bookingInfo.state)) {
      formatted = formatted.replace(
        new RegExp(`${bookingInfo.state},?`, "g"),
        ""
      );
    }

    return formatted.trim().replace(/,\s*,/g, ",").replace(/,$/, "");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <TabHeader title="Confirm Booking" goBack={true} />

      {/* Stepper */}
      <View className="px-5 pt-3">
        <Stepper currentStep={3} />
      </View>

      <ScrollView className="px-5 pb-24" showsVerticalScrollIndicator={false}>
        {/* Service Card - Redesigned */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-5">
          <View className="flex-row items-center justify-start">
            <View className="bg-primary-50 p-3 rounded-xl mr-4">
              <Image
                source={{ uri: serviceInfo?.icon }}
                tintColor={colors.primary}
                className="w-14 h-14"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-psemibold text-primary">
                {serviceInfo?.name || "Service"}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-muted font-psemibold">Price: </Text>
                <Text className="text-text font-psemibold">
                  {serviceInfo?.pricing?.type === "negotiable"
                    ? "Negotiable"
                    : `Rs. ${
                        serviceInfo?.pricing?.amount?.toLocaleString() || "0"
                      } ${
                        serviceInfo?.pricing?.type === "per_hour"
                          ? "/hour"
                          : serviceInfo?.pricing?.type === "per_day"
                          ? "/day"
                          : ""
                      }`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details Section */}
        <Text className="text-lg font-psemibold text-gray-900 mt-8 mb-3">
          Booking Details
        </Text>
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <View className="flex-row items-start mb-4">
            <View className="bg-primary-100 p-2 rounded-full mr-3">
              <MaterialIcons
                name="date-range"
                size={18}
                color={colors.primary}
              />
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Date & Time</Text>
              <Text className="text-gray-900 font-pmedium mt-1">
                {bookingInfo?.scheduled_time
                  ? new Date(bookingInfo.scheduled_time).toLocaleString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Details Section */}
        <Text className="text-lg font-psemibold text-gray-900 mt-6 mb-3">
          Service Location
        </Text>
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <View className="flex-row items-start mb-4">
            <View className="bg-primary-100 p-2 rounded-full mr-3">
              <MaterialIcons
                name="location-on"
                size={18}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Address</Text>
              <Text className="text-gray-900 font-pmedium mt-1">
                {formatAddress()}
              </Text>
            </View>
          </View>
        </View>

        {/* Provider Info Section */}
        {providerInfo?.name && (
          <>
            <Text className="text-lg font-psemibold text-gray-900 mt-6 mb-3">
              Service Provider
            </Text>
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <View className="flex-row items-center">
                {providerInfo?.avatar ? (
                  <Image
                    source={{ uri: providerInfo.avatar }}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mr-4">
                    <MaterialIcons
                      name="person"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                )}
                <View>
                  <Text className="font-psemibold text-gray-900">
                    {providerInfo.name}
                  </Text>
                  {providerInfo?.rating && (
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons
                        name="star"
                        size={16}
                        color={colors.warning}
                      />
                      <Text className="text-gray-600 text-sm ml-1">
                        {providerInfo.rating.toFixed(1)} (
                        {providerInfo.reviews || 0} reviews)
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Customer Notes */}
        {bookingInfo.customer_notes && (
          <>
            <Text className="text-lg font-psemibold text-gray-900 mt-6 mb-3">
              Your Notes
            </Text>
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <Text className="text-gray-600">
                {bookingInfo.customer_notes}
              </Text>
            </View>
          </>
        )}

        {/* Disclaimer */}
        <Text className="text-xs text-gray-500 text-center mt-8 mb-6 leading-5 px-2">
          Note: Final price may vary based on actual service requirements.
          You'll be notified for payment once the provider confirms your
          booking.
        </Text>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
        <View className="flex-row justify-between">
          <CustomButton
            title="Back"
            handlePress={handleCancel}
            containerStyles="bg-gray-100 flex-1 mr-3"
            textStyles="text-text"
            disabled={isPending}
          />
          <CustomButton
            title={isPending ? "Confirming..." : "Confirm Booking"}
            handlePress={handleConfirm}
            containerStyles="bg-primary flex-1"
            textStyles="text-white"
            disabled={isPending}
            isLoading={isPending}
          />
        </View>
      </View>
    </View>
  );
}
