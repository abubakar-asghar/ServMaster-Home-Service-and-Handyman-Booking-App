import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setBookingInfo } from "../../../../../store/slices/bookingSlice";
import Stepper from "../../../../../components/booking/Stepper";
import TabHeader from "../../../../../components/ui/TabHeader";
import CustomButton from "../../../../../components/ui/CustomButton";
import * as Location from "expo-location";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { colors } from "../../../../../constants/colors";
import { setSelectedLocation } from "../../../../../store/slices/locationSlice";
import { customerRoutes } from "../../../../../lib/routes";

export default function Step2() {
  const { slug } = useGlobalSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.location.selected);
  const { bookingInfo, providerInfo } = useSelector((state) => state.booking);

  const [address, setAddress] = useState(
    selectedLocation?.formattedAddress || ""
  );
  const [city, setCity] = useState(selectedLocation?.address.city || "");
  const [state, setState] = useState(selectedLocation?.address.state || "");
  const [description, setDescription] = useState(
    bookingInfo.customer_notes || ""
  );
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [location, setLocation] = useState(
    selectedLocation?.coordinates || null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [region, setRegion] = useState(
    selectedLocation?.coordinates || {
      latitude: 30.3753, // Default to Pakistan coordinates
      longitude: 69.3451,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  // Check if location is within provider's service area
  const isLocationInServiceArea = (loc) => {
    if (!providerInfo || !loc) return true;

    const { coordinates, serviceArea } = providerInfo;
    if (!coordinates || !serviceArea) return true;

    const { type, area } = serviceArea;
    const { latitude, longitude } = loc;
    const providerLat = coordinates.latitude;
    const providerLng = coordinates.longitude;

    switch (type) {
      case "radius":
        // Convert area (in meters) to kilometers
        const radiusKm = parseInt(area) / 1000;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (latitude - providerLat) * (Math.PI / 180);
        const dLng = (longitude - providerLng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(providerLat * (Math.PI / 180)) *
            Math.cos(latitude * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        return distance <= radiusKm;

      case "country":
        // For country-wide service, we'll assume Pakistan only for this example
        return area === "Pakistan";

      case "cities":
      case "states":
        const currentArea = (type === "cities" ? city : state || "")
          .trim()
          .toLowerCase();
        return area.some((a) => a.trim().toLowerCase() === currentArea);

      default:
        return true;
    }
  };

  // Initialize with selected location if available
  useEffect(() => {
    if (selectedLocation?.coordinates) {
      setLocation(selectedLocation.coordinates);
      setAddress(selectedLocation.formattedAddress);
      setCity(selectedLocation.address.city || "");
      setState(selectedLocation.address.region || "");
      setRegion({
        ...selectedLocation.coordinates,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [selectedLocation]);

  const handleNext = async () => {
    if (!address) {
      Alert.alert("Validation", "Please enter your address.");
      return;
    }

    if (!location?.latitude || !location?.longitude) {
      Alert.alert(
        "Validation",
        "Please select a location from map or use your current location."
      );
      return;
    }

    // Check if location is within provider's service area
    if (!isLocationInServiceArea(location)) {
      let message =
        "The selected location is outside the provider's service area.";

      if (providerInfo?.serviceArea?.type === "radius") {
        message += ` Provider only serves within ${providerInfo.serviceArea.area} meters from their location.`;
      } else if (providerInfo?.serviceArea?.type === "country") {
        message += ` Provider only serves within ${providerInfo.serviceArea.area}.`;
      } else if (providerInfo?.serviceArea?.type === "cities") {
        message += ` Provider only serves in these cities: ${providerInfo.serviceArea.area.join(
          ", "
        )}.`;
      } else if (providerInfo?.serviceArea?.type === "states") {
        message += ` Provider only serves in these states: ${providerInfo.serviceArea.area.join(
          ", "
        )}.`;
      }

      Alert.alert("Service Area", message);
      return;
    }

    console.log({
      ...bookingInfo,
      customer_notes: description,
      address,
      city,
      state,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });

    dispatch(
      setBookingInfo({
        ...bookingInfo,
        customer_notes: description,
        address,
        city,
        state,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      })
    );

    router.push(customerRoutes.CUSTOMER_BOOK_SERVICE_STEP3(slug));
  };

  const handlePrevious = () => {
    router.replace(customerRoutes.CUSTOMER_BOOK_SERVICE_STEP2(slug));
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to use this feature"
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Get address from coordinates
      const geoAddress = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let formattedAddress = "";
      let currentCity = "";
      let currentState = "";
      let addressObj = "";
      if (geoAddress.length > 0) {
        addressObj = geoAddress[0];
        const { name, street, district, city, region, postalCode, country } =
          addressObj;
        currentCity = city;
        currentState = region;
        formattedAddress = `${name ? name + ", " : ""}${
          street ? street + ", " : ""
        }${district ? district + ", " : ""}${city ? city + ", " : ""}${
          region ? region + ", " : ""
        }${postalCode ? postalCode + ", " : ""}${country || ""}`;
      }

      const newLocation = { latitude, longitude };
      setLocation(newLocation);
      setAddress(formattedAddress);
      setCity(currentCity);
      setState(currentState);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Update selected location in Redux
      dispatch(
        setSelectedLocation({
          coordinates: newLocation,
          address: addressObj,
          city: currentCity,
          state: currentState,
          formattedAddress,
        })
      );
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your current location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const address = await Location.reverseGeocodeAsync({ latitude, longitude });

    let formattedAddress = "";
    let currentCity = "";
    let currentState = "";
    if (address.length > 0) {
      const first = address[0];
      currentCity = first.city || "";
      currentState = first.region || "";
      formattedAddress = `${first.name ? first.name + ", " : ""}${
        first.street ? first.street + ", " : ""
      }${first.district ? first.district + ", " : ""}${
        first.city ? first.city + ", " : ""
      }${first.region ? first.region + ", " : ""}${
        first.postalCode ? first.postalCode + ", " : ""
      }${first.country || ""}`;
    }

    const newLocation = { latitude, longitude };
    setLocation(newLocation);
    setAddress(formattedAddress);
    setCity(currentCity);
    setState(currentState);
    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));

    // Don't update selectedLocation here - that will be handled by the map selection screen
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader
        title="Book Service"
        goBack={pathname.replace("step2", "step1")}
      />

      {/* Stepper */}
      <Stepper currentStep={2} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "white",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <Text className="mt-5 text-xl font-bold text-gray-800">
          Service Location Details
        </Text>

        {/* Address Section */}
        <View className="mt-4">
          <Text className="font-medium text-gray-700 mb-2">
            Service Address
          </Text>

          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 p-4 bg-white">
            <MaterialIcons
              name="location-on"
              size={20}
              color={colors.primary}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="ml-2 flex-1"
            >
              <Text className="text-gray-700" numberOfLines={1}>
                {address.trim() === "" ? "No address provided" : address.trim()}
              </Text>
            </ScrollView>
          </View>

          {/* Location Actions */}
          <View className="flex-row justify-between mt-3 mb-4">
            <TouchableOpacity
              className="flex-row items-center bg-muted-light px-4 py-2 rounded-lg"
              onPress={() => setIsMapVisible(!isMapVisible)}
            >
              <FontAwesome
                name={isMapVisible ? "map-o" : "map"}
                size={16}
                color={colors.primary}
              />
              <Text className="text-primary font-medium ml-2">
                {isMapVisible ? "Hide Map" : "Choose From Map"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-muted-light px-4 py-2 rounded-lg"
              onPress={handleUseCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialIcons
                  name="my-location"
                  size={16}
                  color={colors.primary}
                />
              )}
              <Text className="text-primary font-medium ml-2">
                Current Location
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map View */}
          {isMapVisible && (
            <View className="h-64 rounded-lg overflow-hidden border border-gray-300 mt-2">
              <MapView
                style={{ flex: 1 }}
                region={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
              >
                {location && (
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Service Location"
                  />
                )}
                {providerInfo?.coordinates && (
                  <Marker
                    coordinate={{
                      latitude: providerInfo.coordinates.latitude,
                      longitude: providerInfo.coordinates.longitude,
                    }}
                    pinColor={colors.secondary}
                    title="Provider Location"
                  />
                )}
              </MapView>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View className="mt-6">
          <Text className="font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </Text>
          <TextInput
            placeholder="Any special instructions for the service provider..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="bg-white border border-gray-300 rounded-lg p-3 text-gray-700"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location Preview */}
        {location && (
          <View className="mt-4 p-3 bg-muted-light rounded-lg">
            <Text className="font-medium text-primary">Selected Location:</Text>
            <Text className="text-gray-700 mt-1">{address}</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Coordinates: {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </Text>
            {!isLocationInServiceArea(location) && (
              <Text className="text-red-500 text-sm mt-1">
                Warning: This location is outside the provider's service area
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="flex-row items-center justify-between p-5 bg-white border-t border-gray-200">
        <CustomButton
          title="Previous"
          handlePress={handlePrevious}
          containerStyles={"bg-gray-200 w-[48%]"}
          textStyles={"text-primary"}
        />
        <CustomButton
          title="Next"
          handlePress={handleNext}
          containerStyles={"bg-primary w-[48%]"}
          textStyles={"text-white"}
          disabled={!address || !location || !isLocationInServiceArea(location)}
        />
      </View>
    </View>
  );
}
