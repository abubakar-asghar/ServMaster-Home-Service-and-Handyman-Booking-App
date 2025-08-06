import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Modal,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { icons } from "../../../../constants";
import { colors } from "../../../../constants/colors";
import CustomButton from "../../../../components/ui/CustomButton";
import TabHeader from "../../../../components/ui/TabHeader";
import { useGlobalSearchParams } from "expo-router";
import {
  useGetBookingDetails,
  useUpdateBookingStatus,
} from "../../../../hooks/useBookings";
import { Feather, Ionicons } from "@expo/vector-icons";
import ProfileImage from "../../../../components/profile/ProfileImage";
import ProviderBookingDetailsSkeleton from "../../../../components/skeletons/bookings/ProviderBookingDetailsSkeleton";
import { providerRoutes } from "../../../../lib/routes";

const cancellationReasons = [
  { id: "schedule_conflict", label: "Schedule conflict" },
  { id: "location_too_far", label: "Location too far" },
  {
    id: "not_available_on_requested_date",
    label: "Not available on requested date",
  },
  { id: "customer_unresponsive", label: "Customer unresponsive" },
  { id: "other", label: "Other reason" },
];

const Heading = ({ title }) => {
  return (
    <Text className="text-primary font-psemibold text-lg mt-6">{title}</Text>
  );
};

const CancellationDetails = ({ cancellation }) => {
  if (!cancellation) return null;

  const getCancelledByText = () => {
    switch (cancellation.cancelled_by) {
      case "Customer":
        return "Cancelled by Customer";
      case "ServiceProvider":
        return "Cancelled by You";
      case "System":
        return "Cancelled by System";
      default:
        return "Cancelled";
    }
  };

  const getFormattedDate = (date) => {
    if (!date) return "N/A";

    const d = new Date(date);

    const formattedDate = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    let ampm = "AM";

    if (hours >= 12) {
      ampm = "PM";
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return `${formattedDate}, ${formattedTime}`;
  };

  return (
    <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
      <View className="flex-row items-center mb-3">
        <Feather name="alert-triangle" size={16} color={colors.danger} />
        <Text className="text-red-600 font-psemibold ml-2">
          {getCancelledByText()}
        </Text>
        <Text className="text-sm text-muted font-pmedium ml-auto">
          {getFormattedDate(cancellation.cancelled_at)}
        </Text>
      </View>

      <View className="bg-red-50 p-3 rounded-lg">
        <Text className="text-gray-800 font-pmedium mb-1">Reason:</Text>
        <Text className="text-gray-700 font-pregular">
          {cancellation.reason || "No reason provided"}
        </Text>
      </View>
    </View>
  );
};

const ProviderBookingDetail = () => {
  const { bookingId } = useGlobalSearchParams();
  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReasonType, setSelectedReasonType] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const {
    data,
    isPending,
    error,
    refetch: refetchBookingDetail,
  } = useGetBookingDetails(bookingId);
  const { mutateAsync: updateBookingStatus, isPending: isUpdating } =
    useUpdateBookingStatus();

  const booking = data?.data;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchBookingDetail();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const dateObj = new Date(booking?.scheduled_time);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleUpdateStatus = async (
    status,
    reason = null,
    reasonType = null
  ) => {
    try {
      await updateBookingStatus({
        bookingId: booking._id,
        status: status.toLowerCase(),
        ...(reason && { reason }),
        ...(reasonType && { reasonType }),
      });
      if (status === "cancelled") {
        setShowCancelModal(false);
        setSelectedReasonType("");
        setOtherReason("");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Error while updating Booking status"
      );
    }
  };

  const handleCancelConfirm = async () => {
    const finalReason =
      selectedReasonType === "other"
        ? otherReason
        : cancellationReasons.find((r) => r.id === selectedReasonType)?.label;

    await handleUpdateStatus("cancelled", finalReason, selectedReasonType);
  };

  const getStatusColor = () => {
    switch (booking?.status) {
      case "pending":
        return { bg: "bg-amber-100", text: "text-amber-800" };
      case "accepted":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "declined":
        return { bg: "bg-red-100", text: "text-red-800" };
      default:
        return { bg: "bg-primary-100", text: "text-primary-800" };
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader
        title="Booking Details"
        goBack={providerRoutes.PROVIDER_BOOKINGS}
      />

      {isPending ? (
        <ProviderBookingDetailsSkeleton />
      ) : error || !data?.data ? (
        <View className="flex-1 justify-center items-center px-5 bg-white">
          <Feather name="alert-circle" size={48} color={colors.danger} />
          <Text className="mt-4 text-red-600 text-lg font-psemibold text-center">
            Failed to load booking details
          </Text>
          <Text className="mt-2 text-muted font-pmedium text-center">
            Please try again later
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-5"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor="#fff"
              />
            }
          >
            {/* Header Section */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <Text className="text-gray-500 font-pmedium mr-2">
                  Booking ID
                </Text>
                <Text className="text-primary font-psemibold">
                  #{booking?._id.slice(-6).toUpperCase()}
                </Text>
              </View>

              <View
                className={`px-3 py-1 rounded-full ${getStatusColor().bg} ${
                  getStatusColor().text
                }`}
              >
                <Text className="text-xs font-psemibold uppercase">
                  {booking.status}
                </Text>
              </View>
            </View>

            {/* Cancellation Details - Show only if cancelled */}
            {booking?.status === "cancelled" && (
              <>
                <Heading title={"Cancellation Details"} />
                <CancellationDetails cancellation={booking?.cancellation} />
              </>
            )}

            {/* Service Information - Heading outside card */}
            <Heading title={"Service Information"} />
            <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
              <View className="flex-row items-center">
                <View className="p-3 bg-primary-50 rounded-lg mr-4">
                  <Image
                    source={{ uri: booking?.service?.icon }}
                    className="w-12 h-12"
                    tintColor={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-primary font-psemibold text-lg">
                    {booking?.service?.name || "Unknown Service"}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Feather name="clock" size={14} color={colors.gray} />
                    <Text className="text-gray-600 font-pmedium text-sm ml-2">
                      {formattedDate} at {formattedTime.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Location Details - Heading outside card */}
            <Heading title={"Location Details"} />
            <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
              <View className="flex-row">
                <Feather name="map-pin" size={16} color={colors.gray} />
                <Text className="text-gray-600 font-pmedium text-sm ml-2 flex-1">
                  {booking?.address}
                </Text>
              </View>

              {booking?.status !== "cancelled" && (
                <View className="flex-row justify-between mt-3">
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => setShowMap((prev) => !prev)}
                  >
                    <Text className="text-primary font-pmedium text-sm mr-2">
                      {showMap ? "Hide Map" : "View on Map"}
                    </Text>
                    <Feather
                      name={showMap ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  {booking?.location?.latitude &&
                    booking?.location?.longitude && (
                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => {
                          const lat = booking.location.latitude;
                          const lng = booking.location.longitude;
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                          Linking.openURL(url).catch((err) =>
                            console.error("Failed to open directions:", err)
                          );
                        }}
                      >
                        <Text className="text-primary font-pmedium text-sm mr-2">
                          Get Directions
                        </Text>
                        <Feather
                          name="arrow-right"
                          size={16}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    )}
                </View>
              )}

              {showMap &&
              booking?.location?.latitude &&
              booking?.location?.longitude ? (
                <View style={{ height: 200, width: "100%", marginTop: 10 }}>
                  {typeof booking.location.latitude === "number" &&
                  typeof booking.location.longitude === "number" ? (
                    <MapView
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: booking.location.latitude,
                        longitude: booking.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: booking.location.latitude,
                          longitude: booking.location.longitude,
                        }}
                        title="Customer Location"
                      />
                    </MapView>
                  ) : (
                    <Text className="text-red-500">Invalid coordinates</Text>
                  )}
                </View>
              ) : (
                showMap && (
                  <Text className="text-red-500">
                    Location data not available
                  </Text>
                )
              )}
            </View>

            {/* Customer Notes - Heading outside card */}
            {booking?.customer_notes && (
              <>
                <Heading title={"Customer Notes"} />
                <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
                  <Text className="text-gray-600 font-pmedium text-sm">
                    {booking?.customer_notes}
                  </Text>
                </View>
              </>
            )}

            {/* Customer Information - Heading outside card */}
            <Heading title={"Customer Information"} />
            <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
              <View className="flex-row items-center">
                <ProfileImage
                  image={booking?.customer.profileImage}
                  className="w-14 h-14 rounded-full mr-4"
                />
                <View>
                  <Text className="text-gray-800 font-psemibold">
                    {booking?.customer?.fullName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Feather name="phone" size={14} color={colors.gray} />
                    <Text className="text-gray-600 font-pmedium text-sm ml-2">
                      {booking?.customer?.phone}
                    </Text>
                  </View>
                </View>
              </View>
              {booking?.status === "accepted" && (
                <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-200 gap-3">
                  <CustomButton
                    icon={
                      <Ionicons
                        name={"call"}
                        size={20}
                        color={colors.primary}
                      />
                    }
                    containerStyles="bg-primary flex-1 p-3"
                    textStyles="text-white"
                    handlePress={() =>
                      Linking.openURL(`tel:${booking?.customer?.phone}`)
                    }
                  />
                  <CustomButton
                    icon={
                      <Ionicons
                        name={"chatbox"}
                        size={20}
                        color={colors.primary}
                      />
                    }
                    containerStyles="bg-white border border-gray-300 flex-1 p-3"
                    textStyles="text-primary"
                    handlePress={() => {}}
                  />
                  <CustomButton
                    icon={
                      <Ionicons
                        name={"logo-whatsapp"}
                        size={20}
                        color={colors.success}
                      />
                    }
                    containerStyles="bg-white border border-gray-300 flex-1 p-3"
                    tintColor={false}
                    handlePress={() =>
                      Linking.openURL(
                        `https://wa.me/${booking?.customer?.phone}`
                      )
                    }
                  />
                </View>
              )}
            </View>

            {/* Pricing Details - Heading outside card */}
            <Heading title={"Pricing Details"} />
            <View className="bg-white rounded-xl p-4 mt-2 mb-6 shadow-sm">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-500 font-pmedium">Type</Text>
                <Text className="text-gray-800 font-psemibold capitalize">
                  {booking?.pricing?.type?.replace("_", " ")}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-t border-gray-200">
                <Text className="text-gray-500 font-pmedium">Amount</Text>
                <Text className="text-primary font-psemibold">
                  {booking?.pricing.type === "negotiable"
                    ? "Negotilable"
                    : `Rs ${booking?.pricing.amount} • ${
                        booking?.pricing.type.slice(0, 1).toUpperCase() +
                        booking?.pricing.type.replace("_", " ").slice(1)
                      }`}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {booking?.status === "pending" && (
            <View className="flex-row px-5 py-3 bg-white border-t border-gray-200">
              <CustomButton
                title="Accept Booking"
                containerStyles="bg-primary flex-1 py-3"
                textStyles="text-white font-psemibold"
                handlePress={() => handleUpdateStatus("accepted")}
                isLoading={isUpdating}
              />
              <View className="w-3" />
              <CustomButton
                title="Decline"
                containerStyles="bg-white border border-gray-300 flex-1 py-3"
                textStyles="text-gray-700 font-psemibold"
                handlePress={() => handleUpdateStatus("declined")}
                isLoading={isUpdating}
              />
            </View>
          )}

          {booking?.status === "accepted" && (
            <View className="flex-row px-5 py-3 bg-white border-t border-gray-200">
              <CustomButton
                title="Mark Complete"
                containerStyles="bg-green-600 flex-1 py-3"
                textStyles="text-white font-psemibold"
                handlePress={() => handleUpdateStatus("completed")}
                isLoading={isUpdating}
              />
              <View className="w-3" />
              <CustomButton
                title="Cancel"
                containerStyles="bg-white border border-gray-300 flex-1 py-3"
                textStyles="text-gray-700 font-psemibold"
                handlePress={() => handleUpdateStatus("cancelled")}
                isLoading={isUpdating}
              />
            </View>
          )}

          {/* Cancel Booking Modal */}
          <Modal
            visible={showCancelModal}
            transparent={true}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={() => {
              setShowCancelModal(false);
              setSelectedReasonType("");
              setOtherReason("");
            }}
          >
            <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
              <View className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
                <Text className="text-xl font-psemibold text-center mb-4">
                  Cancel Booking
                </Text>
                <Text className="text-gray-600 font-pmedium mb-6 text-center">
                  Please let us know why you're canceling this booking
                </Text>

                <View className="mb-4">
                  <Text className="text-gray-800 font-pmedium mb-2">
                    Reason for cancellation
                  </Text>
                  {cancellationReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason.id}
                      className={`flex-row items-center py-3 px-4 mb-2 rounded-lg border ${
                        selectedReasonType === reason.id
                          ? "border-primary bg-primary-50"
                          : "border-gray-200"
                      }`}
                      onPress={() => {
                        setSelectedReasonType(reason.id);
                        if (reason.id !== "other") {
                          setOtherReason("");
                        }
                      }}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border mr-3 ${
                          selectedReasonType === reason.id
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      />
                      <Text className="font-pmedium">{reason.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedReasonType === "other" && (
                  <View className="mb-4">
                    <Text className="text-gray-800 font-pmedium mb-2">
                      Please specify
                    </Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-3 font-pmedium"
                      placeholder="Enter your reason"
                      multiline
                      numberOfLines={3}
                      value={otherReason}
                      onChangeText={setOtherReason}
                    />
                  </View>
                )}

                <View className="flex-row justify-between mt-4">
                  <CustomButton
                    title="Go Back"
                    containerStyles="flex-1 bg-white border-2 border-gray-300 mr-2"
                    textStyles="text-gray-700"
                    handlePress={() => {
                      setShowCancelModal(false);
                      setSelectedReasonType("");
                      setOtherReason("");
                    }}
                  />
                  <CustomButton
                    title="Confirm Cancel"
                    containerStyles={`flex-1 bg-red-500`}
                    textStyles="text-white"
                    handlePress={handleCancelConfirm}
                    disabled={
                      !selectedReasonType ||
                      (selectedReasonType === "other" && !otherReason)
                    }
                    isLoading={isUpdating}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default ProviderBookingDetail;
