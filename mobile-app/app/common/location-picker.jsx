import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import TabHeader from "../../components/ui/TabHeader";
import { colors } from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setSelectedLocation } from "../../store/slices/locationSlice";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useNavigationHistory } from "../../hooks/useNavigationHistory";

export default function LocationPickerScreen() {
  const dispatch = useDispatch();
  const { back } = useNavigationHistory();

  const [region, setRegion] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState(null);
  const [locationText, setLocationText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapType, setMapType] = useState("standard");
  const mapRef = useRef(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location access to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Location.openSettings() },
          ]
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(coords);
      setInitialRegion(coords);
      setMarker({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      await handleReverseGeocode(coords);
    } catch (error) {
      console.error("Error getting location:", error);
      const defaultCoords = {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(defaultCoords);
      setInitialRegion(defaultCoords);
      setMarker({
        latitude: defaultCoords.latitude,
        longitude: defaultCoords.longitude,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverseGeocode = async (coords) => {
    try {
      setIsReverseGeocoding(true);
      const address = await Location.reverseGeocodeAsync(coords);
      if (address.length > 0) {
        const { name, street, district, city, region, postalCode, country } =
          address[0];
        const formatted = `${name ? name + ", " : ""}${
          street ? street + ", " : ""
        }${district ? district + ", " : ""}${city ? city + ", " : ""}${
          region ? region + ", " : ""
        }${postalCode ? postalCode + ", " : ""}${country || ""}`;
        setLocationText(formatted);
        setAddress(address[0]);
      } else {
        setLocationText("Unknown location");
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
      setLocationText("Failed to get address");
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleMapPress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    await handleReverseGeocode(coords);
  };

  const handleZoom = (zoomIn = true) => {
    if (!region) return;
    const factor = zoomIn ? 2 : 0.5;
    mapRef.current.animateToRegion(
      {
        ...region,
        latitudeDelta: region.latitudeDelta / factor,
        longitudeDelta: region.longitudeDelta / factor,
      },
      300
    );
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(coords, 500);
      setMarker({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      await handleReverseGeocode(coords);
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Could not get current location.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    if (!marker || !locationText) {
      Alert.alert("Select Location", "Please select a location on the map.");
      return;
    }

    try {
      setIsConfirming(true);
      dispatch(
        setSelectedLocation({
          coordinates: marker,
          address: address,
          formattedAddress: locationText,
          city: address?.city || "Unknown",
          state: address?.region || "Unknown",
        })
      );
      router.replace(previousRoute || "/");
      clearPreviousRoute();
      disableBackHandling();
    } finally {
      setIsConfirming(false);
    }
  };

  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"));
  };

  if (isLoading && !region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Detecting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabHeader
        title="Select Location"
        goBack
        rightAction={
          <TouchableOpacity
            onPress={handleDone}
            disabled={isConfirming || !marker}
          >
            {isConfirming ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.headerDoneText}>Done</Text>
            )}
          </TouchableOpacity>
        }
      />

      <View style={styles.mapContainer}>
        {/* Address Preview */}
        <View style={styles.addressContainer}>
          <BlurView intensity={90} tint="light" style={styles.blurView}>
            <View style={styles.addressContent}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={colors.primary}
              />
              <View style={styles.addressTextContainer}>
                {isReverseGeocoding ? (
                  <View style={styles.loadingAddress}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingAddressText}>
                      Getting address...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={styles.addressText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {locationText || "Select a location on the map"}
                  </Text>
                )}
              </View>
            </View>
          </BlurView>
        </View>

        {/* Map */}
        {region && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            loadingEnabled={true}
            loadingIndicatorColor={colors.primary}
            loadingBackgroundColor={colors.background}
            customMapStyle={mapStyle}
            mapType={mapType}
          >
            {marker && (
              <Marker coordinate={marker}>
                <View style={styles.markerContainer}>
                  <View style={styles.markerPin} />
                  <View style={styles.markerBase} />
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.mapTypeBtn]}
            onPress={toggleMapType}
          >
            <MaterialIcons
              name={mapType === "standard" ? "satellite" : "map"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.zoomBtn]}
            onPress={() => handleZoom(true)}
          >
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.zoomBtn]}
            onPress={() => handleZoom(false)}
          >
            <MaterialIcons name="remove" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.locationBtn]}
            onPress={handleCurrentLocation}
          >
            <MaterialIcons
              name="my-location"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Confirmation Button */}
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            style={[
              styles.doneBtn,
              (!marker || isConfirming) && { backgroundColor: colors.muted },
            ]}
            onPress={handleDone}
            disabled={!marker || isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.doneBtnText}>Confirm Location</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const mapStyle = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
  headerDoneText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  addressContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  blurView: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  addressTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  loadingAddress: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingAddressText: {
    marginLeft: 8,
    color: colors.text,
  },
  addressText: {
    color: colors.text,
    fontSize: 14,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 100,
    gap: 12,
    alignItems: "center",
  },
  controlBtn: {
    backgroundColor: colors.background,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTypeBtn: {
    backgroundColor: colors.background,
  },
  zoomBtn: {
    backgroundColor: colors.background,
  },
  locationBtn: {
    backgroundColor: colors.background,
  },
  confirmButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  doneBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  markerContainer: {
    alignItems: "center",
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "white",
  },
  markerBase: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginTop: -4,
  },
});
