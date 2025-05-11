import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import Stepper from "../../../../../components/booking/Stepper";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

export default function Step3() {
  const router = useRouter();

  // Getting booking info from Redux (optional, you can use dummy values too)
  const bookingInfo = useSelector((state) => state.booking.bookingInfo);

  const handleConfirm = () => {
    // Here you can call your API to place booking
    alert("Booking Confirmed!");
    router.replace("/customer/home"); // Redirect to Home or Bookings Page
  };

  const handleCancel = () => {
    router.back(); // Go back to Step2
  };

  return (
    <View className="flex-1 bg-white p-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center mb-5">Book Service</Text>

      {/* Stepper */}
      <Stepper currentStep={3} />

      {/* Service Info */}
      <View className="bg-gray-100 p-4 rounded-2xl mt-5 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Carpet Cleaning
          </Text>
          {/* You can dynamically show service name from Redux if needed */}
        </View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/1010/1010982.png",
          }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
      </View>

      {/* Booking Date & Slot */}
      <Text className="mt-7 font-semibold text-gray-700">
        Booking Date & Slot
      </Text>
      <View className="bg-gray-100 p-4 rounded-2xl mt-2">
        <Text className="text-gray-600 mb-1">
          Date: <Text className="font-bold text-gray-800">27-Apr-2025</Text>
        </Text>
        <Text className="text-gray-600">
          Time: <Text className="font-bold text-gray-800">8:00 PM</Text>
        </Text>
      </View>

      {/* Price Detail */}
      <Text className="mt-7 font-semibold text-gray-700">Price Detail</Text>
      <View className="bg-gray-100 p-4 rounded-2xl mt-2">
        {/* Price */}
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600">Price</Text>
          <Text className="text-gray-800 font-semibold">$35.00</Text>
        </View>

        {/* Coupon */}
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600">Coupon</Text>
          <TouchableOpacity>
            <Text className="text-blue-700 font-semibold">Apply Coupon</Text>
          </TouchableOpacity>
        </View>

        {/* Tax */}
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600 flex-row items-center">
            Tax{" "}
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="gray"
            />
          </Text>
          <Text className="text-red-500 font-semibold">$4.55</Text>
        </View>

        {/* Total Amount */}
        <View className="flex-row justify-between mt-2 pt-3 border-t border-gray-300">
          <Text className="text-gray-800 font-bold text-lg">Total Amount</Text>
          <Text className="text-gray-800 font-bold text-lg">$39.55</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <Text className="text-xs text-center text-gray-500 mt-5">
        You will be asked for payment once your booking is completed.
      </Text>

      {/* Buttons */}
      <View className="flex-row justify-between mt-8">
        <TouchableOpacity
          onPress={handleCancel}
          className="border border-red-600 rounded-full px-8 py-3"
        >
          <Text className="text-red-600 font-semibold">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-green-600 rounded-full px-10 py-3"
        >
          <Text className="text-white font-semibold">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
