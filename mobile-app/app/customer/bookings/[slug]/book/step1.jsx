import { View, Text, ScrollView, TouchableOpacity, Pressable, Switch } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setBookingInfo } from "../../../../../store/slices/bookingSlice";
import Stepper from "../../../../../components/booking/Stepper";

export default function Step1() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [use24Hour, setUse24Hour] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const availableDates = [
    { day: "Thu", date: "24" },
    { day: "Fri", date: "25" },
    { day: "Sat", date: "26" },
    { day: "Sun", date: "27" },
  ];

  const availableSlots = ["8:00 PM", "9:00 PM"];

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time.");
      return;
    }

    dispatch(setBookingInfo({
      selectedDate,
      selectedTime,
      use24Hour,
    }));

    router.push("/customer/booking/[slug]/step2"); // Change [slug] dynamically
  };

  return (
    <View className="flex-1 bg-white p-5">

      {/* Header */}
      <Text className="text-xl font-bold text-center mb-5">Book Service</Text>

      {/* Stepper */}
      <Stepper currentStep={1} />

      {/* Date Selection */}
      <Text className="mt-5 font-semibold text-gray-700">Please select Date Time</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {availableDates.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => setSelectedDate(item)}
            className={`p-3 mr-3 rounded-lg border ${selectedDate?.date === item.date ? 'bg-blue-500' : 'border-gray-300'}`}
          >
            <Text className="text-center text-gray-700">{item.date}</Text>
            <Text className="text-center text-gray-500 text-xs">{item.day}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Time Format Toggle */}
      <View className="flex-row items-center justify-between mt-5">
        <Text className="font-medium text-gray-600">Use 24-hour format?</Text>
        <Switch
          value={use24Hour}
          onValueChange={() => setUse24Hour(prev => !prev)}
        />
      </View>

      {/* Available Slots */}
      <Text className="mt-6 font-semibold text-gray-700">Available Slots</Text>
      <View className="flex-row space-x-4 mt-3">
        {availableSlots.map((slot, index) => (
          <Pressable
            key={index}
            onPress={() => setSelectedTime(slot)}
            className={`border p-3 rounded-lg ${selectedTime === slot ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}
          >
            <Text className="text-gray-700">{slot}</Text>
          </Pressable>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        className="absolute bottom-10 left-5 right-5 bg-blue-700 p-4 rounded-full"
      >
        <Text className="text-center text-white font-semibold">Next</Text>
      </TouchableOpacity>

    </View>
  );
}
