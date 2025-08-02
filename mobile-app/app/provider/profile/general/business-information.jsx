import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { icons } from "../../../../constants";
import { usePathname, router } from "expo-router";
import { useSelector } from "react-redux";
import { useUpdateProviderBusinessInfo } from "../../../../hooks/useProvider";
import * as Location from "expo-location";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../../../constants/colors";
import useNavigationStore from "../../../../zustand/navigationStore";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import { commonRoutes } from "../../../../lib/routes";

const modalStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
};

const ProviderBusinessInfo = () => {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const allCitiesOfPakistan = useSelector((state) => state.selectables.cities);
  const allStatesOfPakistan = useSelector((state) => state.selectables.states);
  const selectedLocation = useSelector((state) => state.location.selected);

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [formData, setFormData] = useState(null);

  const { mutateAsync: updateProviderBusinessInfo, isPending } =
    useUpdateProviderBusinessInfo();

  // Initialize form data with user's existing profile image
  useEffect(() => {
    const initialAddress =
      selectedLocation?.formattedAddress || user?.businessInfo?.address || "";
    const initialCity =
      selectedLocation?.address?.city || user?.businessInfo?.city || "";
    const coordinates =
      selectedLocation?.coordinates || {
        longitude: user?.location?.coordinates[0],
        latitude: user?.location?.coordinates[1],
      } ||
      null;

    const initialData = {
      profileImage: user?.profileImage || null,
      type: user?.businessInfo?.type || "individual",
      name: user?.businessInfo?.name || "",
      description: user?.businessInfo?.description || "",
      address: initialAddress,
      city: initialCity,
      hasPhysicalShop: user?.businessInfo?.hasPhysicalShop || null,
      workingDays: user?.businessInfo?.workingDays || [],
      workingHours: {
        startTime: user?.businessInfo?.workingHours?.startTime || "",
        endTime: user?.businessInfo?.workingHours?.endTime || "",
      },
      coordinates,
      serviceArea: {
        type: user?.serviceArea?.type || "radius",
        radiusInMeters: user?.serviceArea?.radiusInMeters || 0,
        cities: user?.serviceArea?.cities || [],
        states: user?.serviceArea?.states || [],
        country: user?.serviceArea?.country || "",
      },
    };

    setFormData(initialData);
    setImage(initialData.profileImage);
    setSelectedCities(initialData.serviceArea.cities);
    setSelectedStates(initialData.serviceArea.states);
  }, [selectedLocation, user]);

  // Image handling functions
  const handleImageAction = async (useCamera = false) => {
    // Request permissions first
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        `We need ${useCamera ? "camera" : "gallery"} permissions to ${
          useCamera ? "take photos" : "select images"
        }`
      );
      return;
    }

    try {
      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          }));

      if (!result.canceled && result.assets?.[0]?.uri) {
        const selectedImage = result.assets[0].uri;
        setImage(selectedImage);
        setFormData((prev) => ({
          ...prev,
          profileImage: selectedImage,
        }));
      }
    } catch (error) {
      console.error("Image selection error:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const [isStartTimeModalVisible, setStartTimeModalVisible] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(
    formData?.workingHours?.startTime || ""
  );
  const [isEndTimeModalVisible, setEndTimeModalVisible] = useState(false);
  const [selectedEndTime, setSelectedEndTime] = useState(
    formData?.workingHours?.endTime || ""
  );

  const handleDays = (day) => {
    if (formData.workingDays.includes(day)) {
      setFormData({
        ...formData,
        workingDays: formData.workingDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        workingDays: [...formData.workingDays, day],
      });
    }
  };

  const generateTimeSlots = () => {
    return [
      "06:00 AM",
      "07:00 AM",
      "08:00 AM",
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
      "07:00 PM",
      "08:00 PM",
      "09:00 PM",
      "10:00 PM",
    ];
  };

  const [timeSlots] = useState(generateTimeSlots());

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return "";
    let [hours, minutes] = time24.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  const timeToMinutes = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const getAvailableStartTimes = () => {
    if (!formData?.workingHours?.endTime) {
      return timeSlots;
    }

    const endTimeInMinutes = timeToMinutes(formData.workingHours.endTime);
    return timeSlots.filter((time) => timeToMinutes(time) < endTimeInMinutes);
  };

  const getAvailableEndTimes = () => {
    if (!formData?.workingHours?.startTime) {
      return timeSlots;
    }

    const startTimeInMinutes = timeToMinutes(formData.workingHours.startTime);
    return timeSlots.filter((time) => timeToMinutes(time) > startTimeInMinutes);
  };

  const handleSelectStartTime = (time) => {
    const convertedTime = convertTo24Hour(time);
    setSelectedStartTime(convertedTime);

    setFormData((prev) => {
      const newData = {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          startTime: convertedTime,
        },
      };

      // If end time is now invalid (before start time), clear it
      if (
        prev.workingHours?.endTime &&
        timeToMinutes(convertTo12Hour(prev.workingHours.endTime)) <=
          timeToMinutes(time)
      ) {
        newData.workingHours.endTime = "";
        setSelectedEndTime("");
      }

      return newData;
    });

    setStartTimeModalVisible(false);
  };

  const handleSelectEndTime = (time) => {
    const convertedTime = convertTo24Hour(time);
    setSelectedEndTime(convertedTime);

    setFormData((prev) => {
      const newData = {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          endTime: convertedTime,
        },
      };

      // If start time is now invalid (after end time), clear it
      if (
        prev.workingHours?.startTime &&
        timeToMinutes(convertTo12Hour(prev.workingHours.startTime)) >=
          timeToMinutes(time)
      ) {
        newData.workingHours.startTime = "";
        setSelectedStartTime("");
      }

      return newData;
    });

    setEndTimeModalVisible(false);
  };

  // Location Handling
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});

    const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
    const address = reverseGeocode[0];

    let formattedAddress = `${address.name || ""}, ${address.street || ""}, ${
      address.city || ""
    }, ${address.region || ""}, ${address.country || ""}`;

    setFormData((prev) => ({
      ...prev,
      address: formattedAddress,
      city: address.city || "",
      coordinates: {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      },
    }));

    console.log("Location:", loc);
    console.log("Address:", address);
  };

  // Set undefined for empty or null fields
  const sanitizeFormData = (data) => {
    const sanitizedData = { ...data };

    for (const key in sanitizedData) {
      if (sanitizedData[key] === "" || sanitizedData[key] === null) {
        sanitizedData[key] = undefined;
      }
    }

    return sanitizedData;
  };

  // Update the handleUpdateBusinessInfo to include the image
  const handleUpdateBusinessInfo = async () => {
    try {
      setUploading(true);

      // Create FormData instance
      const formDataToSend = new FormData();

      // Debug: Log initial form data
      console.log("Original formData:", JSON.stringify(formData, null, 2));

      // Handle image upload
      if (image) {
        if (image.startsWith("file://")) {
          const fileType = image.split(".").pop();
          formDataToSend.append("profileImage", {
            uri: image,
            name: `profile_${Date.now()}.${fileType}`,
            type: `image/${fileType}`,
          });
          console.log("Appending new image file");
        } else {
          formDataToSend.append("profileImage", image);
          console.log("Appending existing image URL");
        }
      }

      // List of fields that need JSON stringification
      const jsonFields = [
        "workingDays",
        "workingHours",
        "coordinates",
        "serviceArea",
      ];

      // Add all other form data
      Object.keys(formData).forEach((key) => {
        if (key !== "profileImage") {
          const value = jsonFields.includes(key)
            ? JSON.stringify(formData[key])
            : formData[key];

          formDataToSend.append(key, value);
          console.log(`Appended ${key}:`, value);
        }
      });

      // Debug: Log FormData contents before sending
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      // Make the API call
      console.log("Making API request...");
      await updateProviderBusinessInfo(formDataToSend);
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
        stack: error.stack,
      });

      // User-friendly error messages
      if (error.code === "ERR_NETWORK") {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again"
        );
      } else if (error.response?.status === 413) {
        Alert.alert("Error", "The file you're trying to upload is too large");
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"Business Information"} goBack />

      {!formData ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text>Loading your business info...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-1 bg-white p-5 w-full">
            {/* Profile Image Section */}
            <View className="items-center mt-4">
              <View className="relative">
                <Pressable onPress={() => handleImageAction(false)}>
                  {image ? (
                    <View className="w-32 h-32 rounded-full border-2 border-primary overflow-hidden">
                      <ExpoImage
                        source={{
                          uri: image,
                          // Add cache key if needed: cacheKey: `profile-${user._id}`
                        }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={200}
                        // Add these troubleshooting props:
                        onError={(e) =>
                          console.log("Image error:", e.nativeEvent.error)
                        }
                        onLoad={() => console.log("Image loaded successfully")}
                      />
                    </View>
                  ) : (
                    <View className="w-32 h-32 rounded-full bg-gray-200 border-2 border-primary items-center justify-center">
                      <Feather name="user" size={48} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => handleImageAction(true)}
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-2"
                >
                  <Feather name="camera" size={20} color="white" />
                </Pressable>
              </View>
              <Text className="text-primary font-pmedium mt-2">
                {image ? "Change Profile Image" : "Add Profile Image"}
              </Text>
            </View>

            <View className="h-[1px] bg-[#E0E0E0] my-5" />

            {/* Provider Type */}
            <View className="">
              <Text className="text-base text-text font-pmedium">
                I want to use this App as a
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                {[
                  { label: "Individual", value: "individual" },
                  { label: "Business", value: "business" },
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    className={`rounded-xl p-3 w-[48%] ${
                      formData?.type === item.value
                        ? "bg-primary"
                        : "bg-muted-100"
                    }`}
                    onPress={() => {
                      setFormData({ ...formData, type: item.value });
                    }}
                  >
                    <Text
                      className={`text-base text-center font-pmedium ${
                        formData?.type === item.value
                          ? "text-white"
                          : "text-text"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Service / Business Name */}
            <FormField
              title="Service / Business Name"
              placeholder="Enter your Service / Business name"
              icon={null}
              value={formData?.name}
              handleChangeText={(value) =>
                setFormData({ ...formData, name: value })
              }
              otherStyles="mt-5"
            />

            {/* Service / Business Type */}
            <FormField
              title="Service / Business Description"
              placeholder="Enter your Service / Business description"
              icon={null}
              value={formData?.description}
              handleChangeText={(value) => {
                setFormData({ ...formData, description: value });
              }}
              otherStyles="mt-5"
              multiline
              numberOfLines={3}
              style={{ height: 100, alignItems: "flex-start", paddingTop: 6 }}
            />

            <View className="h-[1px] bg-[#E0E0E0] my-5" />

            {/* Provider Type */}
            <View>
              <Text className="text-base text-text font-pmedium">
                Do you work from Shop / Office
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                {[
                  { lable: "Yes", value: true },
                  { lable: "No", value: false },
                ].map((item) => (
                  <Pressable
                    key={item.lable}
                    className={`rounded-xl p-3 w-[48%] ${
                      formData?.hasPhysicalShop === item.value
                        ? "bg-primary"
                        : "bg-muted-100"
                    }`}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        hasPhysicalShop: item.value,
                      });
                    }}
                  >
                    <Text
                      className={`text-base text-center font-pmedium ${
                        formData?.hasPhysicalShop === item.value
                          ? "text-white"
                          : "text-text"
                      }`}
                    >
                      {item.lable}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Address */}
            <Pressable className="mt-5">
              <Text className="text-base text-text font-pmedium">Address</Text>

              <View className="w-full h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center overflow-hidden">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: 10,
                    alignItems: "center",
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-text font-pmedium text-base">
                      {formData?.address || "No address selected"}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </Pressable>

            <View className="flex-row justify-between mt-3 gap-3">
              <Pressable
                className="flex-row gap-2 items-center"
                onPress={requestLocationPermission}
              >
                <Ionicons name="location" color={colors.primary} size={16} />
                <Text className="text-center text-text font-pmedium">
                  Use Current Location
                </Text>
              </Pressable>
              <Pressable
                className="flex-row gap-2 items-center"
                onPress={() => {
                  useNavigationStore.getState().setPreviousRoute(pathname);
                  useNavigationStore.getState().enableBackHandling();
                  router.push(commonRoutes.LOCATION_PICKER);
                }}
              >
                <MaterialIcons name="map" size={18} color={colors.primary} />
                <Text className="text-center text-text font-pmedium">
                  Select from Map
                </Text>
              </Pressable>
            </View>

            <View className="h-[1px] bg-[#E0E0E0] my-5" />
            {/* Working Area */}
            <View>
              <Text className="text-base text-text font-pmedium">
                Select Working Area
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                {["radius", "cities", "states", "country"].map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        serviceArea: {
                          ...formData.serviceArea,
                          type,
                        },
                      });
                    }}
                    className="flex-row items-center space-x-2 mb-2 gap-2"
                  >
                    <View
                      className={`w-4 h-4 rounded-full border ${
                        formData?.serviceArea?.type === type
                          ? "bg-primary border-primary"
                          : "border-gray-400"
                      }`}
                    />
                    <Text className="capitalize text-center text-sm font-pregular text-text">
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {formData?.serviceArea?.type === "radius" && (
                <FormField
                  title="Radius in Meters"
                  placeholder="Enter radius in meters"
                  icon={null}
                  value={user?.serviceArea?.radiusInMeters?.toString() || ""}
                  handleChangeText={(value) => {
                    setFormData({
                      ...formData,
                      serviceArea: {
                        type: "radius",
                        radiusInMeters: parseInt(value, 10) || 0,
                      },
                    });
                  }}
                  otherStyles="mt-3"
                  keyboardType="numeric"
                />
              )}
              {formData?.serviceArea?.type === "cities" && (
                <Pressable
                  onPress={() => setShowCityModal(true)}
                  className="mt-3"
                >
                  <Text className="text-base text-text font-pmedium mb-1">
                    Cities
                  </Text>
                  <View className="w-full h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 flex flex-row items-center overflow-hidden">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text className="text-text font-pmedium text-base">
                        {selectedCities.length > 0
                          ? selectedCities.join(", ")
                          : "No cities selected"}
                      </Text>
                    </ScrollView>
                  </View>
                </Pressable>
              )}
              {formData?.serviceArea?.type === "states" && (
                <Pressable
                  onPress={() => setShowStateModal(true)}
                  className="mt-3"
                >
                  <Text className="text-base text-text font-pmedium mb-1">
                    States
                  </Text>
                  <View className="w-full h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 flex flex-row items-center overflow-hidden">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text className="text-text font-pmedium text-base">
                        {selectedStates.length > 0
                          ? selectedStates.join(", ")
                          : "No states selected"}
                      </Text>
                    </ScrollView>
                  </View>
                </Pressable>
              )}
              {formData?.serviceArea?.type === "country" && (
                <FormField
                  title="Country"
                  placeholder="Enter country"
                  icon={null}
                  value={user?.serviceArea?.country || ""}
                  handleChangeText={(value) => {
                    setFormData({
                      ...formData,
                      serviceArea: {
                        type: "country",
                        country: value.trim(),
                      },
                    });
                  }}
                  otherStyles="mt-3"
                  editable={false}
                />
              )}
            </View>

            {/* Working Days */}
            <View className="mt-5">
              <Text className="text-base text-text font-pmedium">
                Select Working Days
              </Text>
              <View className="flex-row flex-wrap items-center mt-3 gap-2">
                {[
                  { label: "Monday", value: "monday" },
                  { label: "Tuesday", value: "tuesday" },
                  { label: "Wednesday", value: "wednesday" },
                  { label: "Thursday", value: "thursday" },
                  { label: "Friday", value: "friday" },
                  { label: "Saturday", value: "saturday" },
                  { label: "Sunday", value: "sunday" },
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    className={`rounded-xl py-2 px-3 ${
                      formData?.workingDays.includes(item.value)
                        ? "bg-primary"
                        : "bg-muted-100"
                    }`}
                    onPress={() => {
                      handleDays(item.value);
                    }}
                  >
                    <Text
                      className={`text-center text-sm font-pregular ${
                        formData?.workingDays.includes(item.value)
                          ? "text-white"
                          : "text-text"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Working Hours */}
            <View className="mt-5">
              <Text className="text-base text-text font-pmedium">
                Select Working Hours
              </Text>

              <View className="w-full flex-row items-end justify-between mt-3 gap-4">
                <Pressable
                  className="flex-1 h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center"
                  onPress={() => setStartTimeModalVisible(true)}
                >
                  <Text className="flex-1 text-text font-pmedium text-base">
                    {formData?.workingHours?.startTime
                      ? convertTo12Hour(formData.workingHours.startTime)
                      : "Select Start Time"}
                  </Text>
                </Pressable>

                <Text className="text-text font-pregular">to</Text>

                <Pressable
                  className="flex-1 h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 focus:border-primary flex flex-row items-center"
                  onPress={() => setEndTimeModalVisible(true)}
                >
                  <Text className="flex-1 text-text font-pmedium text-base">
                    {formData?.workingHours?.endTime
                      ? convertTo12Hour(formData.workingHours.endTime)
                      : "Select End Time"}
                  </Text>
                </Pressable>
              </View>

              {/* Validation message if needed */}
              {formData?.workingHours?.startTime &&
                formData?.workingHours?.endTime && (
                  <Text className="text-green-600 font-pregular mt-2">
                    Working hours:{" "}
                    {convertTo12Hour(formData.workingHours.startTime)} -{" "}
                    {convertTo12Hour(formData.workingHours.endTime)}
                  </Text>
                )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Buttons */}
      <View className="flex-row items-center justify-between p-5 border-t border-t-gray-200">
        <CustomButton
          title={"Go Back"}
          handlePress={() => router.back()}
          containerStyles={"bg-secondary w-[48%]"}
          disabled={uploading || isPending}
        />
        <CustomButton
          title={"Update"}
          handlePress={handleUpdateBusinessInfo}
          containerStyles={"bg-primary w-[48%]"}
          isLoading={isPending || uploading}
          disabled={uploading}
        />
      </View>

      {/* SELECT CITIES MODAL */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center px-5 bg-black/50">
          <View
            className="bg-white p-10 max-h-[60%] rounded-3xl"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text className="text-lg font-psemibold text-center mb-4">
              Select Cities
            </Text>
            <ScrollView className="max-h-[400px]">
              {allCitiesOfPakistan.map((city) => {
                const isSelected = selectedCities.includes(city);
                return (
                  <Pressable
                    key={city}
                    className={`py-3 px-4 my-1 rounded-xl ${
                      isSelected ? "bg-primary" : "bg-muted-100"
                    }`}
                    onPress={() => {
                      const updated = isSelected
                        ? selectedCities.filter((c) => c !== city)
                        : [...selectedCities, city];

                      setSelectedCities(updated);
                      setFormData((prev) => ({
                        ...prev,
                        serviceArea: {
                          ...prev.serviceArea,
                          type: "cities",
                          cities: updated,
                        },
                      }));
                    }}
                  >
                    <Text
                      className={`${isSelected ? "text-white" : "text-text"}`}
                    >
                      {city}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View className="flex-row items-center gap-3">
              <CustomButton
                title="Done"
                handlePress={() => setShowCityModal(false)}
                containerStyles="flex-1 mt-5 bg-primary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* SELECT STATES MODAL */}
      <Modal
        visible={showStateModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center px-5 bg-black/50">
          <View
            className="bg-white p-10 max-h-[60%] rounded-3xl"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text className="text-lg font-psemibold text-center mb-4">
              Select States
            </Text>
            <ScrollView className="max-h-[400px]">
              {allStatesOfPakistan.map((state) => {
                const isSelected = selectedStates.includes(state);
                return (
                  <Pressable
                    key={state}
                    className={`py-3 px-4 my-1 rounded-xl ${
                      isSelected ? "bg-primary" : "bg-muted-100"
                    }`}
                    onPress={() => {
                      const updated = isSelected
                        ? selectedStates.filter((c) => c !== state)
                        : [...selectedStates, state];

                      setSelectedStates(updated);
                      setFormData((prev) => ({
                        ...prev,
                        serviceArea: {
                          ...prev.serviceArea,
                          type: "states",
                          states: updated,
                        },
                      }));
                    }}
                  >
                    <Text
                      className={`${isSelected ? "text-white" : "text-text"}`}
                    >
                      {state}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View className="flex-row items-center gap-3">
              <CustomButton
                title="Done"
                handlePress={() => setShowStateModal(false)}
                containerStyles="flex-1 mt-5 bg-primary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Start Time Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isStartTimeModalVisible}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center px-5 bg-black/50">
          <View
            className="bg-white p-10 max-h-[60%] rounded-3xl"
            style={modalStyle}
          >
            <Text className="text-lg font-psemibold text-center mb-4">
              Select Start Time
            </Text>
            <ScrollView className="max-h-[300px]">
              {getAvailableStartTimes().map((time) => (
                <Pressable
                  key={time}
                  className="py-3 px-4 border-b border-gray-200"
                  onPress={() => handleSelectStartTime(time)}
                >
                  <Text className="text-base text-text text-center">
                    {time}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <CustomButton
              title="Cancel"
              handlePress={() => setStartTimeModalVisible(false)}
              containerStyles="mt-5 bg-secondary"
            />
          </View>
        </View>
      </Modal>

      {/* End Time Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEndTimeModalVisible}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center px-5 bg-black/50">
          <View
            className="bg-white p-10 max-h-[60%] rounded-3xl"
            style={modalStyle}
          >
            <Text className="text-lg font-psemibold text-center mb-4">
              Select End Time
            </Text>
            <ScrollView className="max-h-[300px]">
              {getAvailableEndTimes().map((time) => (
                <Pressable
                  key={time}
                  className="py-3 px-4 border-b border-gray-200"
                  onPress={() => handleSelectEndTime(time)}
                >
                  <Text className="text-base text-text text-center">
                    {time}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <CustomButton
              title="Cancel"
              handlePress={() => setEndTimeModalVisible(false)}
              containerStyles="mt-5 bg-secondary"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProviderBusinessInfo;
