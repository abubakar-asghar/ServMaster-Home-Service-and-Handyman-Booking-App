import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { router, usePathname, useGlobalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { setBookingInfo } from "../../../../../store/slices/bookingSlice";
import Stepper from "../../../../../components/booking/Stepper";
import TabHeader from "../../../../../components/ui/TabHeader";
import CustomButton from "../../../../../components/ui/CustomButton";
import moment from "moment";
import { getProvidersBookedSlots } from "../../../../../api/services/customerApi";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGetProviderProfileForCustomer } from "../../../../../hooks/useProvider";
import { customerRoutes } from "../../../../../lib/routes";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export default function Step1() {
  const { slug } = useGlobalSearchParams();
  const ids = slug.split("-");
  const serviceId = ids[0];
  const providerId = ids[1];
  const dispatch = useDispatch();
  const { bookingInfo } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [use24Hour, setUse24Hour] = useState(false);

  // Fetch booked slots from backend
  const { data, isPending, error } = useQuery({
    queryKey: ["booked-time-slots", providerId],
    queryFn: () => getProvidersBookedSlots(providerId),
  });

  const { data: pData, isPending: isProviderPending } =
    useGetProviderProfileForCustomer(providerId);

  const bookedSlotsMap = (data && data.data) || {};

  // Setup working days & slots
  useEffect(() => {
    const today = moment();
    const workingDays = pData?.data?.businessInfo?.workingDays || [];

    // Normalize working days to match moment's format (capitalized full day names)
    const normalizedWorkingDays = workingDays.map(
      (day) => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
    );

    const next7Days = Array.from({ length: 7 }).map((_, i) =>
      today.clone().add(i, "days")
    );

    const filtered = next7Days.filter((day) =>
      normalizedWorkingDays.includes(day.format("dddd"))
    );

    const formatted = filtered.map((d) => ({
      fullDate: d.format("YYYY-MM-DD"),
      day: d.format("ddd"),
      date: d.format("D"),
      month: d.format("MMM"),
      momentObj: d,
      isToday: d.isSame(today, "day"),
    }));

    setAvailableDates(formatted);

    // Auto-select today if available
    const todayOption = formatted.find((date) => date.isToday);
    if (todayOption) {
      setSelectedDate(todayOption);
    }
  }, [pData]);

  // When date selected, compute available slots
  useEffect(() => {
    if (!selectedDate) return;

    const bookedForDay = bookedSlotsMap[selectedDate.fullDate] || [];
    const workingHours = user?.businessInfo?.workingHours || {
      start: "08:00",
      end: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    };

    // Generate time slots based on provider's working hours
    const slots = [];
    let currentTime = moment(workingHours.start, "HH:mm");
    const endTime = moment(workingHours.end, "HH:mm");
    const breakStart = moment(workingHours.breakStart, "HH:mm");
    const breakEnd = moment(workingHours.breakEnd, "HH:mm");

    while (currentTime.isBefore(endTime)) {
      if (!currentTime.isBetween(breakStart, breakEnd)) {
        slots.push(currentTime.format("HH:mm"));
      }
      currentTime.add(1, "hour");
    }

    const available = slots.filter((slot) => !bookedForDay.includes(slot));
    setAvailableSlots(available);
    setSelectedTime(null); // reset
  }, [selectedDate, bookedSlotsMap, user]);

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Validation", "Please select a date and time.");
      return;
    }

    const fullDate = moment(
      `${selectedDate.fullDate} ${selectedTime}`,
      "YYYY-MM-DD HH:mm"
    );

    dispatch(
      setBookingInfo({
        ...bookingInfo,
        scheduled_time: fullDate.toISOString(),
      })
    );

    router.push(customerRoutes.CUSTOMER_BOOK_SERVICE_STEP2(slug));
  };

  const formatTime = (timeStr) => {
    return use24Hour ? timeStr : moment(timeStr, "HH:mm").format("hh:mm A");
  };

  return (
    <View className="flex-1 bg-white">
      <TabHeader title="Book Service" goBack />
      <Stepper currentStep={1} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "white",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selection */}
        <Text className="font-bold text-lg text-gray-800 mt-3">
          Select a Date
        </Text>

        {isPending || isProviderPending ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {[1, 2, 3, 4, 5].map((_, index) => (
              <ShimmerPlaceholder
                key={index}
                style={styles.shimmerDate}
                shimmerColors={["#ebebeb", "#c5c5c5", "#ebebeb"]}
              />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {availableDates.map((item) => (
              <Pressable
                key={item.fullDate}
                onPress={() => setSelectedDate(item)}
                className={`p-3 mr-3 rounded-lg border-2 ${
                  selectedDate?.fullDate === item.fullDate
                    ? "bg-primary"
                    : item.isToday
                    ? "border-primary bg-primary/10"
                    : "border-gray-300"
                }`}
                style={{ minWidth: 70 }}
              >
                <Text
                  className={`text-center font-bold ${
                    selectedDate?.fullDate === item.fullDate
                      ? "text-white"
                      : item.isToday
                      ? "text-primary"
                      : "text-gray-700"
                  }`}
                >
                  {item.date}
                </Text>
                <Text
                  className={`text-center text-xs mb-1 ${
                    selectedDate?.fullDate === item.fullDate
                      ? "text-white"
                      : item.isToday
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {item.day}
                </Text>
                {item.isToday && (
                  <Text className="text-center text-xs text-primary">
                    Today
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Time Format Toggle */}
        <View className="flex-row items-center justify-between mt-6 p-3 bg-gray-50 rounded-lg">
          <Text className="font-medium text-gray-700">Use 24-hour format</Text>
          <Switch
            value={use24Hour}
            onValueChange={() => setUse24Hour((prev) => !prev)}
            trackColor={{ false: "#767577", true: "#3b82f6" }}
            thumbColor={use24Hour ? "#f5f5f5" : "#f4f3f4"}
          />
        </View>

        {/* Time Slots */}
        <Text className="mt-6 font-bold text-lg text-gray-800">
          Available Time Slots
        </Text>

        {isPending || isProviderPending ? (
          <View className="flex-row flex-wrap gap-3 mt-3">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <ShimmerPlaceholder
                key={index}
                style={styles.shimmerTime}
                shimmerColors={["#ebebeb", "#c5c5c5", "#ebebeb"]}
              />
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3 mt-3">
            {availableSlots.length === 0 ? (
              <View className="w-full p-4 bg-gray-50 rounded-lg">
                <Text className="text-center text-gray-500">
                  {selectedDate
                    ? "No available slots for this date"
                    : "Please select a date to see available slots"}
                </Text>
              </View>
            ) : (
              availableSlots.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  className={`border px-4 py-3 rounded-lg ${
                    selectedTime === slot
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                  style={{ minWidth: 90 }}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedTime === slot ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {formatTime(slot)}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Next Button */}
      <View className="px-5 pb-4 bg-white">
        <CustomButton
          title="Next"
          handlePress={handleNext}
          containerStyles={"bg-primary py-3 rounded-lg"}
          textStyles={"font-bold text-white"}
          disabled={!selectedDate || !selectedTime}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerDate: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  shimmerTime: {
    width: 90,
    height: 46,
    borderRadius: 8,
  },
});
