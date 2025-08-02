import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import TabHeader from "../../../../../../components/ui/TabHeader";
import { useGlobalSearchParams, usePathname, router } from "expo-router";
import { useGetProvidersByService } from "../../../../../../hooks/useProvider";
import { icons, images } from "../../../../../../constants";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import CustomButton from "../../../../../../components/ui/CustomButton";
import useNavigationStore from "../../../../../../zustand/navigationStore";
import { colors } from "../../../../../../constants/colors";
import { useDispatch, useSelector } from "react-redux";
import {
  setBookingInfo,
  setProviderInfo,
  setServiceInfo,
} from "../../../../../../store/slices/bookingSlice";
import ProfileImage from "../../../../../../components/profile/ProfileImage";
import * as Location from "expo-location";
import { setSelectedLocation } from "../../../../../../store/slices/locationSlice";
import ProviderCardsSkeleton from "../../../../../../components/skeletons/customer/ProviderCardsSkeleton";
import { commonRoutes, customerRoutes } from "../../../../../../lib/routes";

export default function ProvidersOfParticularService() {
  const dispatch = useDispatch();
  const { service } = useGlobalSearchParams();
  const pathname = usePathname();
  const selectedLocation = useSelector((state) => state.location.selected);
  const [userLocation, setUserLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const { data, error, isPending, refetch } = useGetProvidersByService(
    service,
    selectedLocation || userLocation
  );

  const serviceProviders = Array.isArray(data?.data?.providers)
    ? data.data.providers
    : [];
  const serviceDetails = data?.data?.service || {};

  useEffect(() => {
    const initializeLocation = async () => {
      if (!selectedLocation) {
        await getUserLocation();
      }
      refetch();
    };
    initializeLocation();
  }, [selectedLocation]);

  const getUserLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const { address, formattedAddress } = await getAddress(
        latitude,
        longitude
      );

      const locationData = {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        city: address?.city || "",
        state: address?.region || "",
        formattedAddress: formattedAddress,
      };

      dispatch(setSelectedLocation(locationData));
      setUserLocation(locationData);
      setAddress(formattedAddress);
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError("Unable to get your current location");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleBookNow = (serviceDetails, matchedService, provider) => {
    dispatch(
      setBookingInfo({
        service: serviceDetails._id,
        service_provider: provider._id,
      })
    );
    dispatch(
      setServiceInfo({
        name: serviceDetails.name,
        icon: serviceDetails.parent_service?.icon || icons.repairingService,
        pricing: matchedService.pricing,
      })
    );
    dispatch(
      setProviderInfo({
        coordinates: {
          longitude: provider.location?.coordinates[0] || 0,
          latitude: provider.location?.coordinates[1] || 0,
        },
        serviceArea: {
          type: provider.serviceArea.type || "radius",
          area:
            provider.serviceArea.type === "radius"
              ? provider.serviceArea.radiusInMeters.toString()
              : provider.serviceArea.type === "country"
              ? "Pakistan"
              : provider.serviceArea.type === "cities" ||
                provider.serviceArea.type === "states"
              ? provider.serviceArea[provider.serviceArea.type.toString()]
              : "5000",
        },
      })
    );
    const slug = serviceDetails._id + "-" + provider._id;
    useNavigationStore.getState().setPreviousRoute(pathname);
    useNavigationStore.getState().enableBackHandling();
    router.push(customerRoutes.CUSTOMER_BOOK_SERVICE_STEP1(slug));
  };

  const navigateToProviderProfile = (providerId) => {
    useNavigationStore.getState().setPreviousRoute(pathname);
    useNavigationStore.getState().enableBackHandling();
    router.push(customerRoutes.CUSTOMER_PROVIDER_PROFILE(providerId));
  };

  const navigateToMapSelection = () => {
    useNavigationStore.getState().setPreviousRoute(pathname);
    router.push({
      pathname: commonRoutes.LOCATION_PICKER,
      params: {
        serviceId: service,
        returnScreen: pathname,
      },
    });
  };

  const formatPrice = (pricing) => {
    if (!pricing) return "Price not specified";
    if (pricing.type === "negotiable") return "Negotiable Price";
    return `Rs. ${pricing.amount} • ${
      pricing.type.slice(0, 1).toUpperCase() +
      pricing.type.replace("_", " ").slice(1)
    }`;
  };

  const renderLocationSection = () => {
    if (selectedLocation) {
      return (
        <LocationCard
          location={selectedLocation}
          getUserLocation={getUserLocation}
          navigateToMapSelection={navigateToMapSelection}
          locationLoading={locationLoading}
        />
      );
    }

    if (locationError) {
      return (
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color={colors.error} />
              <Text className="ml-2 text-gray-700">{locationError}</Text>
            </View>
            <TouchableOpacity
              onPress={getUserLocation}
              className="px-3 py-1 bg-primary/10 rounded-full"
            >
              <Text className="text-primary font-pmedium">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (locationLoading) {
      return (
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="ml-2 text-gray-700">Getting your location...</Text>
          </View>
        </View>
      );
    }

    return (
      <LocationCard
        location={selectedLocation}
        getUserLocation={getUserLocation}
        navigateToMapSelection={navigateToMapSelection}
      />
    );
  };

  const renderProviderItem = ({ item: provider }) => {
    const serviceBlock = provider.selectedServices.find((block) =>
      block.services.some((s) => s.service?.toString() === service.toString())
    );

    if (!serviceBlock) return null;

    const matchedService = serviceBlock.services.find(
      (s) => s.service?.toString() === service.toString()
    );

    return (
      <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
        {/* Service Info */}
        <View className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <Image
            source={{
              uri:
                serviceDetails.parent_service?.icon || icons.repairingService,
            }}
            className="w-14 h-14 mr-3"
            resizeMode="contain"
            tintColor={colors.primary}
          />
          <View className="flex-1">
            <Text className="text-base font-psemibold text-gray-800">
              {serviceDetails.name}
            </Text>
            <Text className="text-sm font-pmedium text-primary mt-1">
              {formatPrice(matchedService?.pricing)}
            </Text>
          </View>
        </View>

        {/* Provider Info */}
        <TouchableOpacity
          className="flex-row items-center mb-3"
          onPress={() => navigateToProviderProfile(provider._id)}
        >
          <ProfileImage
            imageUrl={provider.profileImage}
            className="w-16 h-16 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="text-base font-psemibold text-gray-800">
              {provider.fullName}
            </Text>
            <Text className="text-sm text-gray-500">
              {provider.businessInfo?.name || "Independent Professional"}
            </Text>
            {provider.distance && (
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text className="text-xs text-gray-600 ml-1">
                  {provider.distance < 1
                    ? `${(provider.distance * 1000).toFixed(0)}m away`
                    : `${provider.distance.toFixed(1)}km away`}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text className="ml-1 text-sm font-pmedium">
              {provider.rating?.average?.toFixed(1) || "New"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Book Button */}
        <CustomButton
          title="Book Now"
          containerStyles="mt-4 w-full bg-primary"
          handlePress={() =>
            handleBookNow(serviceDetails, matchedService, provider)
          }
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title="Available Providers" goBack />

      <FlatList
        data={serviceProviders}
        renderItem={renderProviderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View className="p-4">
            {/* Location Section */}
            {renderLocationSection()}

            {!isPending && !error && serviceProviders.length > 0 && (
              <Text className="text-lg font-psemibold text-gray-800 my-1">
                {serviceDetails.name} Providers
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          isPending || locationLoading ? (
            <View>
              {[...Array(4)].map((_, index) => (
                <ProviderCardsSkeleton key={index} />
              ))}
            </View>
          ) : error ? (
            <View className="items-center justify-center p-6">
              <Ionicons name="warning-outline" size={40} color={colors.error} />
              <Text className="text-lg font-psemibold text-gray-800 mt-3">
                Failed to load providers
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Please check your internet connection and try again
              </Text>
              <CustomButton
                title="Retry"
                containerStyles="mt-4 w-full bg-primary"
                handlePress={refetch}
              />
            </View>
          ) : (
            <View className="justify-center items-center p-6">
              <Image
                source={icons.notFound}
                style={{ width: 120, height: 120 }}
                tintColor={colors.muted}
                resizeMode="contain"
              />
              <Text className="text-xl font-psemibold text-gray-800 mt-4 text-center">
                No Providers Available
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                {selectedLocation
                  ? "We couldn't find any providers for this service in the selected area"
                  : "We couldn't find any providers for this service in your area"}
              </Text>
              <CustomButton
                title="Browse Other Services"
                containerStyles="mt-6 w-full bg-primary"
                handlePress={() => router.back()}
              />
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isPending}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const LocationCard = ({
  location,
  getUserLocation,
  locationLoading,
  navigateToMapSelection,
}) => {
  // Handle null location
  if (!location) {
    return (
      <View className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        <Text className="text-gray-700 font-pmedium mb-2">
          Service Location
        </Text>
        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 p-3">
          <Ionicons name="location-sharp" size={20} color={colors.primary} />
          <Text className="text-gray-800 font-pmedium text-base ml-2">
            Location not selected
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-3">
          <TouchableOpacity
            className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
            onPress={getUserLocation}
          >
            {locationLoading ? (
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
          <TouchableOpacity
            className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
            onPress={navigateToMapSelection}
          >
            <FontAwesome name="map" size={16} color={colors.primary} />
            <Text className="text-primary font-medium ml-2">
              Choose From Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
      <Text className="text-gray-700 font-pmedium mb-2">Service Location</Text>

      {/* Scrollable Address Container */}
      <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 p-3">
        <Ionicons name="location-sharp" size={20} color={colors.primary} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="ml-2 flex-1"
        >
          <Text
            className="text-gray-800 font-pmedium text-base"
            numberOfLines={1}
          >
            {location?.formattedAddress || "Select your location"}
          </Text>
        </ScrollView>
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <TouchableOpacity
          className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
          onPress={getUserLocation}
        >
          {locationLoading ? (
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
        <TouchableOpacity
          className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
          onPress={navigateToMapSelection}
        >
          <FontAwesome name="map" size={16} color={colors.primary} />
          <Text className="text-primary font-medium ml-2">Choose From Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getAddress = async (latitude, longitude) => {
  try {
    const address = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    let formattedAddress = "Unknown location";
    if (address.length > 0) {
      const { name, street, district, city, region, postalCode, country } =
        address[0];
      formattedAddress = `${name ? name + ", " : ""}${
        street ? street + ", " : ""
      }${district ? district + ", " : ""}${city ? city + ", " : ""}${
        region ? region + ", " : ""
      }${postalCode ? postalCode + ", " : ""}${country || ""}`;
    }

    return {
      address: address[0] || {},
      formattedAddress,
    };
  } catch (error) {
    console.error("Error getting address:", error);
    return {
      address: {},
      formattedAddress: "Could not get address",
    };
  }
};
