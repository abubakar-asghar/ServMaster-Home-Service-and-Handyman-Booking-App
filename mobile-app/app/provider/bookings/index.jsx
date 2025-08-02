import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Easing,
  FlatList,
  Modal,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import TabHeader from "../../../components/ui/TabHeader";
import Dropdown from "../../../components/ui/Dropdown";
import CustomButton from "../../../components/ui/CustomButton";
import { icons } from "../../../constants";
import { colors } from "../../../constants/colors";
import {
  useGetProviderBookings,
  useUpdateBookingStatus,
} from "../../../hooks/useBookings";
import { useDispatch, useSelector } from "react-redux";
import { setProviderBookings } from "../../../store/slices/providerBookingsSlice";
import { router } from "expo-router";
import ProviderBookingsSkeleton from "../../../components/skeletons/bookings/ProviderBookingsSkeleton";
import { Feather } from "@expo/vector-icons";
import { providerRoutes } from "../../../lib/routes";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import { useLocalSearchParams } from "expo-router";

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

const ProviderBookings = () => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);
  const params = useLocalSearchParams();
  const status = params?.status;

  console.log("ProviderBookings status:", status);

  const bookings = useSelector((state) => state.providerBookings.bookings);
  const [bookingStatus, setBookingStatus] = useState("All");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedReasonType, setSelectedReasonType] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status) {
      setBookingStatus(status);
    }
  }, [status]);

  const {
    data,
    isPending: isLoadingBookings,
    refetch: refetchBookings,
  } = useGetProviderBookings();
  const { mutateAsync: updateBookingStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus();

  useEffect(() => {
    if (data?.data) {
      dispatch(setProviderBookings(data.data));
      if (data.data.length > 0) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      }
    }
  }, [data]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchBookings();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
      fadeAnim.setValue(1);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredBookings =
    bookingStatus.toString().toLowerCase() === "all"
      ? bookings
      : bookings.filter((b) => b.status === bookingStatus.toLowerCase());

  const handleCancelConfirm = async (bookingId) => {
    try {
      // Combine the reason if "other" was selected
      const finalReason =
        selectedReasonType === "other"
          ? otherReason
          : cancellationReasons.find((r) => r.id === selectedReasonType)?.label;

      await updateBookingStatus({
        bookingId,
        status: "cancelled",
        reason: finalReason,
        reasonType: selectedReasonType,
      });
      setShowCancelModal(false);
      setSelectedBookingId(null);
      refetchBookings();
      setSelectedReasonType("");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Error while updating Booking status"
      );
    }
  };

  const renderBookingItem = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50 * (index + 1), 0],
            }),
          },
        ],
      }}
    >
      <BookingItem
        item={item}
        setShowCancelModal={setShowCancelModal}
        setSelectedBookingId={setSelectedBookingId}
        refetch={refetchBookings}
        fadeAnim={fadeAnim}
      />
    </Animated.View>
  );

  const EmptyComponent = () => (
    <View className="flex-1 items-center justify-center px-5">
      <View className="items-center">
        <Image
          source={icons.notFound}
          className="w-40 h-40 opacity-80"
          resizeMode="contain"
          tintColor={colors.primary}
        />

        <Text className="text-primary text-xl font-psemibold text-center mt-6">
          {bookingStatus === "All"
            ? "No Bookings Yet"
            : `No ${bookingStatus} Bookings`}
        </Text>

        <Text className="text-muted text-base font-pmedium text-center mt-2 max-w-[300px]">
          {bookingStatus === "All"
            ? "You don't have any bookings yet. Your upcoming appointments will appear here."
            : `You don't have any ${bookingStatus.toLowerCase()} bookings at the moment.`}
        </Text>

        {bookingStatus !== "All" && (
          <CustomButton
            title="View All Bookings"
            handlePress={() => setBookingStatus("All")}
            containerStyles="bg-primary mt-6 px-6 py-3 rounded-lg"
            textStyles="text-white font-psemibold"
          />
        )}

        {bookingStatus === "All" && (
          <View className="mt-6 items-center">
            <Text className="text-muted text-sm font-pmedium mb-2">
              Tips to get more bookings:
            </Text>
            <View className="items-start gap-1">
              <View className="flex-row items-center">
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text className="text-gray-600 font-pregular text-sm ml-2">
                  Complete your profile
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text className="text-gray-600 font-pregular text-sm ml-2">
                  Add more services
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text className="text-gray-600 font-pregular text-sm ml-2">
                  Set competitive pricing
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <TabHeader title={"Bookings"} />

      {isLoadingBookings && !refreshing ? (
        <ProviderBookingsSkeleton />
      ) : (
        <View className="flex-1">
          <View className="px-5 py-2 mt-3">
            <CustomDropdown
              options={[
                { value: "All", label: "All Bookings" },
                { value: "Pending", label: "Pending" },
                { value: "Accepted", label: "Accepted" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
              selectedValue={bookingStatus}
              onValueChange={setBookingStatus}
            />
          </View>

          <FlatList
            ref={flatListRef}
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={EmptyComponent}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 20,
              flexGrow: 1,
            }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor="#fff"
              />
            }
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
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
          setSelectedBookingId(null);
        }}
      >
        {/* Full screen container with safe area padding */}
        <View
          className="flex-1"
          style={{
            // paddingTop: insets.top,
            // paddingBottom: insets.bottom,
            backgroundColor: "rgba(0,0,0,0.5)", // Optional semi-transparent background
          }}
        >
          {/* Actual modal content */}
          <View className="flex-1 p-5 mt-10 items-center justify-center overflow-hidden">
            <View className="bg-white rounded-3xl p-10 w-full">
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
                  <Pressable
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
                  </Pressable>
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
                  handlePress={() => setShowCancelModal(false)}
                />
                <CustomButton
                  title="Cancel"
                  containerStyles={`flex-1 bg-red-500`}
                  textStyles="text-white"
                  handlePress={() => handleCancelConfirm(selectedBookingId)}
                  disabled={
                    !selectedReasonType ||
                    (selectedReasonType === "other" && !otherReason)
                  }
                  isLoading={isUpdatingStatus}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const BookingItem = ({
  item,
  setShowCancelModal,
  setSelectedBookingId,
  refetch,
  fadeAnim,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const [isClickable, setIsClickable] = useState(true);

  const { mutateAsync: updateBookingStatus, isPending: isAccepting } =
    useUpdateBookingStatus();

  const date = new Date(item.scheduled_time);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus({ bookingId, status });
      refetch();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Error while updating Booking status"
      );
    }
  };

  const handleCancelPress = () => {
    setSelectedBookingId(item._id);
    setShowCancelModal(true);
  };

  const getStatusColor = () => {
    switch (item.status) {
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

  const statusColors = getStatusColor();

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        className="p-5 rounded-2xl bg-white shadow-md border border-gray-100"
        onPress={() => {
          setIsClickable(false);
          router.push(providerRoutes.PROVIDER_BOOKING_DETAILS(item._id));
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isClickable}
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="p-4 bg-primary-50 rounded-xl items-center justify-center shadow-xs">
            <Image
              source={
                item?.service?.icon
                  ? { uri: item.service.icon }
                  : icons.services
              }
              tintColor={colors.primary}
              className="h-14 w-14"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View
                className={`px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.text}`}
              >
                <Text className="text-xs font-psemibold uppercase">
                  {item.status}
                </Text>
              </View>
              <Text className="text-gray-600 font-pmedium text-sm">
                #{item._id.slice(-6).toUpperCase()}
              </Text>
            </View>
            <Text className="text-primary font-psemibold text-lg mt-2">
              {item.service?.name || "Unnamed Service"}
            </Text>
            <Text className="text-gray-700 font-pmedium text-base mt-1">
              {item.pricing.type !== "negotiable"
                ? `Rs ${item.pricing?.amount || "0"} • ${
                    item.pricing.type.slice(0, 1).toUpperCase() +
                    item.pricing?.type.replace("_", " ").slice(1)
                  }`
                : "Negotiable Price"}
            </Text>
          </View>
        </View>

        <View className="bg-muted-light p-4 rounded-xl gap-2 mt-4">
          {[
            {
              label: "Address",
              value: item.address || "N/A",
              icon: "map-pin",
            },
            {
              label: "Date & Time",
              value: `${formattedDate} at ${formattedTime.toUpperCase()}`,
              icon: "calendar",
            },
            {
              label: "Customer",
              value: item.customer?.fullName || "Unknown",
              icon: "user",
            },
          ].map((data, idx) => (
            <View
              key={idx}
              className={`flex-row items-center justify-between py-2 ${
                idx !== 0 ? "border-t border-gray-200" : ""
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Feather name={data.icon} size={16} color={colors.muted} />
                <Text className="text-gray-500 font-pmedium text-sm">
                  {data.label}
                </Text>
              </View>
              <Text
                className={`flex-1 text-right text-gray-800 font-pmedium text-sm ${
                  idx === 0 && "ml-10"
                }`}
                numberOfLines={1}
              >
                {data.value}
              </Text>
            </View>
          ))}

          {/* Action Buttons */}
          <View className="flex-row items-center justify-between mt-3">
            {item.status === "pending" && (
              <>
                <CustomButton
                  title={"Accept"}
                  handlePress={() => handleUpdateStatus(item._id, "accepted")}
                  containerStyles={"bg-primary w-[48%] py-2"}
                  textStyles="text-white font-psemibold"
                  disabled={isAccepting}
                  isLoading={isAccepting}
                />
                <CustomButton
                  title="Decline"
                  containerStyles="bg-white border border-gray-300 w-[48%] py-2"
                  textStyles="text-gray-700 font-psemibold"
                  handlePress={() => handleUpdateStatus(item._id, "declined")}
                  disabled={isAccepting}
                />
              </>
            )}
            {item.status === "accepted" && (
              <>
                <CustomButton
                  title="Completed"
                  containerStyles="bg-green-600 w-[48%] py-2"
                  textStyles="text-white font-psemibold"
                  handlePress={() => handleUpdateStatus(item._id, "completed")}
                />
                <CustomButton
                  title="Cancel"
                  containerStyles="bg-white border border-gray-300 w-[48%] py-2"
                  textStyles="text-gray-700 font-psemibold"
                  handlePress={handleCancelPress}
                />
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default ProviderBookings;
