import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../../../constants/colors";
import TabHeader from "../../../../components/ui/TabHeader";
import { useUpdateCustomer } from "../../../../hooks/useCustomer";
import CustomButton from "../../../../components/ui/CustomButton";
import FormField from "../../../../components/ui/FormField";

const CustomerPersonalDetail = () => {
  const { user } = useSelector((state) => state.auth);
  const { mutateAsync: updateCustomer, isPending: isUpdating } =
    useUpdateCustomer();

  // Form state
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    profileImage: user.profileImage || null,
    address: user.address || "",
    city: user.city || "",
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photos to upload a profile picture"
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUploading(true);
        const uri = result.assets[0].uri;

        // Create a local copy of the image
        const localUri = `${FileSystem.cacheDirectory}${uri.split("/").pop()}`;
        await FileSystem.copyAsync({ from: uri, to: localUri });

        setLocalImageUri(localUri);
        setFormData({
          ...formData,
          profileImage: uri,
        });
        setImageUploading(false);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      setImageUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your camera to take a photo"
        );
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUploading(true);
        const uri = result.assets[0].uri;

        // Create a local copy of the image
        const localUri = `${FileSystem.cacheDirectory}${uri.split("/").pop()}`;
        await FileSystem.copyAsync({ from: uri, to: localUri });

        setLocalImageUri(localUri);
        setFormData({
          ...formData,
          profileImage: uri,
        });
        setImageUploading(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);

      // Add image file if new one was selected
      if (localImageUri) {
        formDataToSend.append("profileImage", {
          uri: localImageUri,
          name: `profile_${user._id}.jpg`,
          type: "image/jpeg",
        });
      } else if (formData.profileImage) {
        // If using existing image URL
        formDataToSend.append("profileImage", formData.profileImage);
      }

      await updateCustomer({
        customerId: user._id,
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title="Edit Profile" goBack />

      <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View className="items-center mb-5">
          <View className="relative">
            {imageUploading ? (
              <View className="w-36 h-36 rounded-full bg-gray-200 items-center justify-center border-4 border-primary/20">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : formData.profileImage ? (
              <Image
                source={{ uri: formData.profileImage }}
                className="w-36 h-36 rounded-full border-4 border-primary/20"
              />
            ) : (
              <View className="w-36 h-36 rounded-full bg-gray-200 items-center justify-center border-4 border-primary/20">
                <FontAwesome name="user" size={52} color={colors.primary} />
              </View>
            )}

            {/* Edit Icon */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-primary rounded-full p-3 border-2 border-white"
              onPress={pickImage}
            >
              <FontAwesome name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-6 gap-3">
            <CustomButton
              title="Gallery"
              handlePress={pickImage}
              icon={
                <FontAwesome name="photo" size={18} color={colors.primary} />
              }
              containerStyles="bg-primary/10 px-6 py-3 rounded-xl"
              textStyles="text-primary"
            />

            <CustomButton
              title="Camera"
              handlePress={takePhoto}
              icon={
                <FontAwesome name="camera" size={18} color={colors.primary} />
              }
              containerStyles="bg-primary/10 px-6 py-3 rounded-xl"
              textStyles="text-primary"
            />
          </View>
        </View>

        {/* Form Fields */}
        <View className="gap-5">
          <FormField
            title="Full Name"
            value={formData.fullName}
            placeholder="Enter your full name"
            handleChangeText={(text) => handleChange("fullName", text)}
            otherStyles="mt-2"
          />

          {/* Phone Number (read-only) */}
          <View>
            <Text className="text-base text-text font-pmedium">
              Phone Number
            </Text>
            <View className="w-full h-16 px-5 bg-gray-100 rounded-2xl border-2 border-gray-200 flex flex-row items-center">
              <Text className="flex-1 text-text font-pmedium text-base">
                {formData.phone}
              </Text>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={colors.muted}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-2 ml-1">
              Contact support to change phone number
            </Text>
          </View>

          {/* <FormField
            title="Address"
            value={formData.address}
            placeholder="Enter your address"
            handleChangeText={(text) => handleChange("address", text)}
          />

          <FormField
            title="City"
            value={formData.city}
            placeholder="Enter your city"
            handleChangeText={(text) => handleChange("city", text)}
          /> */}
        </View>

        {/* Save Button */}
        <CustomButton
          title="Save Changes"
          handlePress={handleSubmit}
          containerStyles="mt-8 bg-primary"
          textStyles="text-white"
          isLoading={isUpdating}
          disabled={isUpdating || imageUploading}
        />
      </ScrollView>
    </View>
  );
};

export default CustomerPersonalDetail;
