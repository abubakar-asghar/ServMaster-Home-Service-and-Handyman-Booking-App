import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Camera } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import CustomButton from "../../../../components/ui/CustomButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const IdentityVerification = () => {
  const router = useRouter();
  const cameraRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoType, setPhotoType] = useState("profile");
  const [photos, setPhotos] = useState({
    profile: null,
    cnicFront: null,
    cnicBack: null,
  });
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Camera permission error:", error);
        Alert.alert("Error", "Failed to get camera permissions");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openCamera = (type) => {
    setPhotoType(type);
    setIsCameraOpen(true);
    setCameraType(Camera.Constants.Type.back);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      setPhotos((prev) => ({ ...prev, [photoType]: photo.uri }));
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture image");
    } finally {
      setIsCameraOpen(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const handleSubmit = () => {
    if (!photos.profile || !photos.cnicFront || !photos.cnicBack) {
      Alert.alert("Incomplete", "Please capture all required images");
      return;
    }
    console.log("Submitting photos:", photos);
  };

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-5">
        <Text className="text-lg text-gray-800 mb-4">
          Camera access is required for identity verification
        </Text>
        <CustomButton
          title="Request Camera Access"
          handlePress={() => Camera.requestCameraPermissionsAsync()}
          containerStyles="bg-primary w-full"
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TabHeader title="Professional Information" goBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-5">
          {/* Profile Photo Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-900">
                Your Photo
              </Text>
              <Text className="text-red-500 font-medium">Not Verified</Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <View className="relative">
                <Image
                  source={{
                    uri: photos.profile || "https://via.placeholder.com/100",
                  }}
                  className="w-24 h-24 rounded-full border border-gray-200"
                />
                <Pressable
                  onPress={() => openCamera("profile")}
                  className="absolute bottom-0 right-0 bg-primary p-2 rounded-full"
                >
                  <Ionicons name="camera" size={16} color="white" />
                </Pressable>
              </View>
              <Text className="text-gray-600 text-sm">
                {photos.profile
                  ? "Photo captured"
                  : "Take a clear photo of your face"}
              </Text>
            </View>
          </View>

          {/* CNIC Number Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-gray-900">
                ID Card (CNIC) Number
              </Text>
              <Text className="text-red-500 font-medium">Not Verified</Text>
            </View>
            <View className="flex-row justify-between space-x-2">
              <TextInput
                placeholder="33100"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-center"
                keyboardType="number-pad"
                maxLength={5}
              />
              <Text className="text-xl pt-2">-</Text>
              <TextInput
                placeholder="2323233"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-center"
                keyboardType="number-pad"
                maxLength={7}
              />
              <Text className="text-xl pt-2">-</Text>
              <TextInput
                placeholder="1"
                className="w-12 border border-gray-300 rounded-xl px-3 py-2 text-center"
                keyboardType="number-pad"
                maxLength={1}
              />
            </View>
          </View>

          {/* CNIC Image Upload Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              CNIC Images
            </Text>
            <View className="space-y-4">
              <Pressable
                onPress={() => openCamera("cnicFront")}
                className="border border-gray-300 rounded-xl px-4 py-3 flex justify-center items-center"
              >
                {photos.cnicFront ? (
                  <Image
                    source={{ uri: photos.cnicFront }}
                    className="w-full h-40 rounded-lg"
                  />
                ) : (
                  <View className="flex items-center">
                    <Ionicons name="document" size={24} color="gray" />
                    <Text className="text-gray-600 mt-2">
                      Upload Front Side of CNIC
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => openCamera("cnicBack")}
                className="border border-gray-300 rounded-xl px-4 py-3 flex justify-center items-center"
              >
                {photos.cnicBack ? (
                  <Image
                    source={{ uri: photos.cnicBack }}
                    className="w-full h-40 rounded-lg"
                  />
                ) : (
                  <View className="flex items-center">
                    <Ionicons name="document" size={24} color="gray" />
                    <Text className="text-gray-600 mt-2">
                      Upload Back Side of CNIC
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row items-center justify-between p-5 border-t border-gray-200">
        <CustomButton
          title="Go Back"
          handlePress={() => router.back()}
          containerStyles="bg-secondary w-[48%]"
        />
        <CustomButton
          title="Update"
          handlePress={handleSubmit}
          containerStyles="bg-primary w-[48%]"
          disabled={!photos.profile || !photos.cnicFront || !photos.cnicBack}
        />
      </View>

      {/* Camera Modal */}
      <Modal
        visible={isCameraOpen}
        animationType="slide"
        onRequestClose={() => setIsCameraOpen(false)}
      >
        <View className="flex-1 bg-black">
          {hasPermission && (
            <Camera
              className="flex-1"
              type={cameraType}
              ref={cameraRef}
              ratio="16:9"
              onCameraReady={() => setIsCameraReady(true)}
            >
              <View className="flex-1 bg-transparent flex-row justify-center items-end pb-10">
                <View className="flex-row items-center space-x-8">
                  <Pressable
                    onPress={() => setIsCameraOpen(false)}
                    className="p-3"
                  >
                    <Ionicons name="close" size={32} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={takePicture}
                    className="w-20 h-20 bg-white rounded-full border-4 border-gray-300"
                  />
                  <Pressable onPress={toggleCameraType} className="p-3">
                    <Ionicons name="camera-reverse" size={32} color="white" />
                  </Pressable>
                </View>
              </View>
            </Camera>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default IdentityVerification;
