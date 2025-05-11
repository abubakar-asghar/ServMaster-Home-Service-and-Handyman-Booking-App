import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setBookingInfo } from "../../../../../store/slices/bookingSlice";
import Stepper from "../../../../../components/booking/Stepper";

export default function Step2() {
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const handleNext = () => {
    if (!address) {
      alert("Please enter your address.");
      return;
    }

    dispatch(
      setBookingInfo({
        address,
        description,
      })
    );

    router.push("/customer/booking/[slug]/step3"); // Change [slug] dynamically
  };

  const handlePrevious = () => {
    router.back(); // Navigate back to Step1
  };

  return (
    <View className="flex-1 bg-white p-5">
      {/* Header */}
      <Text className="text-xl font-bold text-center mb-5">Book Service</Text>

      {/* Stepper */}
      <Stepper currentStep={2} />

      {/* Form */}
      <Text className="mt-5 font-semibold text-gray-700">
        Enter Detail Information
      </Text>

      {/* Address Input */}
      <View className="bg-gray-100 p-4 rounded-lg mt-3">
        <Text className="font-medium text-gray-600 mb-2">Your Address:</Text>
        <View className="flex-row items-center border rounded-lg p-3 mb-4 bg-white">
          {/* You can add a location icon here if you want */}
          <TextInput
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
            className="flex-1 text-gray-700"
          />
        </View>

        {/* Choose from Map / Use Current Location */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity>
            <Text className="text-blue-700 font-semibold">Choose From Map</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-blue-700 font-semibold">
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <Text className="font-medium text-gray-600 mb-2">Description:</Text>
        <TextInput
          placeholder="Enter Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className="bg-white border rounded-lg p-3 text-gray-700"
        />
      </View>

      {/* Buttons */}
      <View className="flex-row justify-between mt-10">
        <TouchableOpacity
          onPress={handlePrevious}
          className="border border-blue-700 rounded-full px-8 py-3"
        >
          <Text className="text-blue-700 font-semibold">Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-700 rounded-full px-10 py-3"
        >
          <Text className="text-white font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
