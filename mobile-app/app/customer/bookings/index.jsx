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
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import TabHeader from "../../../components/ui/TabHeader";
import { colors } from "../../../constants/colors";
import Dropdown from "../../../components/ui/Dropdown";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useGetCustomerBookings } from "../../../hooks/useBookings";
import {
  setCustomerBookings,
  clearCustomerBookings,
} from "../../../store/slices/customerBookingsSlice";
import CustomerBookingsSkeleton from "../../../components/skeletons/bookings/CustomerBookingsSkeleton";
import { Feather } from "@expo/vector-icons";
import { icons } from "../../../constants";
import CustomButton from "../../../components/ui/CustomButton";
import { customerRoutes } from "../../../lib/routes";
import CustomDropdown from "../../../components/ui/CustomDropdown";

const CustomerBookings = () => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  const bookings = useSelector((state) => state.customerBookings.bookings);
  const [bookingStatus, setBookingStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    isPending,
    refetch: refetchBookings,
  } = useGetCustomerBookings();

  useEffect(() => {
    if (data?.data) {
      dispatch(setCustomerBookings(data.data));
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
      : bookings.filter(
          (b) => b.status?.toLowerCase() === bookingStatus.toLowerCase()
        );

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
      <BookingItem item={item} />
    </Animated.View>
  );

  const EmptyComponent = () => (
    <View className="flex-1 items-center justify-center px-5">
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
          ? "You haven't made any bookings yet. Your appointments will appear here."
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
            Ready to book a service?
          </Text>
          <CustomButton
            title="Explore Services"
            handlePress={() => router.push(customerRoutes.CUSTOMER_CATEGORIES)}
            containerStyles="bg-white border border-primary mt-2 px-6 py-3 rounded-lg"
            textStyles="text-primary font-psemibold"
          />
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <TabHeader title="My Bookings" />

      {isPending && !refreshing ? (
        <CustomerBookingsSkeleton />
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
    </View>
  );
};

const BookingItem = ({ item }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

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

  const status = item?.status?.toLowerCase()?.trim();

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return { bg: "bg-amber-100", text: "text-amber-800" };
      case "accepted":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  const statusColors = getStatusColor();

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        className="p-5 rounded-2xl bg-white shadow-md border border-gray-100"
        onPress={() =>
          router.push(customerRoutes.CUSTOMER_BOOKING_DETAILS(item._id))
        }
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="p-4 bg-primary-50 rounded-xl items-center justify-center shadow-xs">
            <Image
              source={{ uri: item.service.icon }}
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
              {item.service.name}
            </Text>
            <Text className="text-gray-700 font-pmedium text-base mt-1">
              {item?.pricing.type === "negotiable"
                ? "Negotilable"
                : `Rs ${item?.pricing.amount} • ${
                    item?.pricing.type.slice(0, 1).toUpperCase() +
                    item?.pricing.type.replace("_", " ").slice(1)
                  }`}
            </Text>
          </View>
        </View>

        <View className="bg-muted-light p-4 rounded-xl gap-2 mt-4">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center gap-2">
              <Feather name="calendar" size={14} color={colors.gray} />
              <Text className="text-gray-500 font-pmedium text-sm">
                Date & Time
              </Text>
            </View>
            <Text className="text-gray-800 font-pmedium text-sm">
              {formattedDate} at {formattedTime.toUpperCase()}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-2 border-t border-gray-200">
            <View className="flex-row items-center gap-2">
              <Feather name="user" size={14} color={colors.gray} />
              <Text className="text-gray-500 font-pmedium text-sm">
                Provider
              </Text>
            </View>
            <Text className="text-gray-800 font-pmedium text-sm">
              {item.service_provider?.fullName || "Not assigned"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default CustomerBookings;
