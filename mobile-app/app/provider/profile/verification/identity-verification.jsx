import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import TabHeader from "../../../../components/ui/TabHeader";
import CustomButton from "../../../../components/ui/CustomButton";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useVerifyProviderIdentity } from "../../../../hooks/useProvider";
import mime from "mime";
import * as ImageManipulator from "expo-image-manipulator";
import { useSelector } from "react-redux";
import { colors } from "../../../../constants/colors";

const IdentityVerification = () => {
  const { user } = useSelector((state) => state.auth);
  const [photoType, setPhotoType] = useState("selfie");
  const [photos, setPhotos] = useState({
    selfie: user?.verification?.identity?.selfie || null,
    cnicFront: user?.verification?.identity?.cnicFront || null,
    cnicBack: user?.verification?.identity?.cnicBack || null,
  });
  const [modifiedPhotos, setModifiedPhotos] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [cnicParts, setCnicParts] = useState({
    part1: user?.verification?.identity?.cnicNumber?.split("-")[0] || "",
    part2: user?.verification?.identity?.cnicNumber?.split("-")[1] || "",
    part3: user?.verification?.identity?.cnicNumber?.split("-")[2] || "",
  });

  const { mutateAsync: verifyIdentity, isPending } =
    useVerifyProviderIdentity();

  const takePicture = async (type) => {
    setPhotoType(type);
    setIsLoading(true);

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera access is needed to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,
        cameraType:
          type === "selfie"
            ? ImagePicker.CameraType.front
            : ImagePicker.CameraType.back,
      });

      if (!result.canceled) {
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [],
          { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG }
        );

        setPhotos((prev) => ({ ...prev, [type]: manipulated.uri }));
        setModifiedPhotos((prev) => ({ ...prev, [type]: manipulated.uri }));
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const { part1, part2, part3 } = cnicParts;
    const fullCnic = `${part1}-${part2}-${part3}`;
    const formData = new FormData();

    const appendFile = (uri, key) => {
      if (!uri) return;
      const fileName = uri.split("/").pop();
      const mimeType = mime.getType(uri);
      formData.append(key, {
        uri,
        name: fileName,
        type: mimeType,
      });
    };

    if (modifiedPhotos.selfie) appendFile(modifiedPhotos.selfie, "selfie");
    if (modifiedPhotos.cnicFront)
      appendFile(modifiedPhotos.cnicFront, "cnicFront");
    if (modifiedPhotos.cnicBack)
      appendFile(modifiedPhotos.cnicBack, "cnicBack");

    formData.append("cnicNumber", fullCnic);

    if (
      !formData.has("selfie") &&
      !formData.has("cnicFront") &&
      !formData.has("cnicBack")
    ) {
      Alert.alert("No changes", "You haven't updated any photos.");
      return;
    }

    try {
      await verifyIdentity(formData);
      setModifiedPhotos({});
      Alert.alert("Success", "Verification submitted successfully");
    } catch (error) {
      Alert.alert("Error", error?.message || "Something went wrong.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <TabHeader title="Professional Information" goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Profile Photo */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-pmedium text-text">
                Your Photo
              </Text>
              <Text className="text-red-500 font-pmedium">
                {user?.verification?.identity?.status === "verified"
                  ? "Verified"
                  : "Not Verified"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <View className="relative">
                <Image
                  source={{
                    uri: photos.selfie || "https://via.placeholder.com/100",
                  }}
                  className="w-24 h-24 rounded-full border border-gray-200"
                />
                <Pressable
                  onPress={() => takePicture("selfie")}
                  className="absolute bottom-0 right-0 bg-primary p-2 rounded-full"
                  disabled={isLoading}
                >
                  {isLoading && photoType === "selfie" ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="camera" size={16} color="white" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-600 text-sm ml-4">
                {photos.selfie
                  ? "Photo captured"
                  : "Take a clear photo of your face"}
              </Text>
            </View>
          </View>

          {/* CNIC Number */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-pmedium text-text">
                ID Card (CNIC) Number
              </Text>
              <Text className="text-red-500 font-pmedium">
                {user?.verification?.identity?.status === "verified"
                  ? "Verified"
                  : "Not Verified"}
              </Text>
            </View>
            <View className="flex-row justify-between space-x-2">
              <TextInput
                placeholder="xxxxx"
                value={cnicParts.part1}
                onChangeText={(text) =>
                  setCnicParts({ ...cnicParts, part1: text })
                }
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-center"
                keyboardType="number-pad"
                maxLength={5}
              />
              <TextInput
                placeholder="xxxxxxx"
                value={cnicParts.part2}
                onChangeText={(text) =>
                  setCnicParts({ ...cnicParts, part2: text })
                }
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-center"
                keyboardType="number-pad"
                maxLength={7}
              />
              <TextInput
                placeholder="x"
                value={cnicParts.part3}
                onChangeText={(text) =>
                  setCnicParts({ ...cnicParts, part3: text })
                }
                className="w-12 border border-gray-300 rounded-xl px-3 py-2 text-center"
                keyboardType="number-pad"
                maxLength={1}
              />
            </View>
          </View>

          {/* CNIC Images */}
          <View className="mb-6">
            <Text className="text-base font-pmedium text-text mb-2">
              CNIC Images
            </Text>
            <View className="space-y-4 gap-4">
              {["cnicFront", "cnicBack"].map((side) => (
                <Pressable
                  key={side}
                  onPress={() => takePicture(side)}
                  className="border border-gray-300 rounded-xl px-4 py-3 flex justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading && photoType === side ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : photos[side] ? (
                    <Image
                      source={{ uri: photos[side] }}
                      className="w-full h-52 rounded-lg"
                    />
                  ) : (
                    <View className="flex items-center">
                      <Ionicons name="document" size={24} color="gray" />
                      <Text className="text-gray-600 mt-2">
                        Upload {side === "cnicFront" ? "Front" : "Back"} Side of
                        CNIC
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="flex-row items-center justify-between p-5 border-t border-gray-200">
        <CustomButton
          title="Go Back"
          handlePress={() => router.back()}
          containerStyles="bg-secondary w-[48%]"
          disabled={isPending}
        />
        <CustomButton
          title="Update"
          handlePress={handleSubmit}
          containerStyles="bg-primary w-[48%]"
          disabled={Object.keys(modifiedPhotos).length === 0 || isPending}
          isLoading={isPending}
        />
      </View>
    </View>
  );
};

export default IdentityVerification;

// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   Modal,
//   Image,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import React, { useState, useEffect, useRef } from "react";
// import { Camera, CameraView } from "expo-camera";
// import TabHeader from "../../../../components/ui/TabHeader";
// import CustomButton from "../../../../components/ui/CustomButton";
// import { router } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useVerifyProviderIdentity } from "../../../../hooks/useProvider";
// import mime from "mime";
// import * as ImageManipulator from "expo-image-manipulator";
// import { useSelector } from "react-redux";

// const IdentityVerification = () => {
//   const { user } = useSelector((state) => state.auth);

//   const cameraRef = useRef(null);
//   const cameraTypes = {
//     front: "front",
//     back: "back",
//   };

//   const [hasPermission, setHasPermission] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const [photoType, setPhotoType] = useState("selfie");
//   const [photos, setPhotos] = useState({
//     selfie: user?.verification?.identity?.selfie || null,
//     cnicFront: user?.verification?.identity?.cnicFront || null,
//     cnicBack: user?.verification?.identity?.cnicBack || null,
//   });
//   const [cameraFacing, setCameraFacing] = useState(cameraTypes.back);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       setIsLoading(true);
//       try {
//         const { status } = await Camera.requestCameraPermissionsAsync();
//         setHasPermission(status === "granted");
//       } catch (error) {
//         console.error("Camera permission error:", error);
//         Alert.alert("Error", "Failed to get camera permissions");
//       } finally {
//         setIsLoading(false);
//       }
//     })();
//   }, []);

//   const openCamera = (type) => {
//     setPhotoType(type);
//     setIsCameraOpen(true);
//     setCameraFacing(cameraTypes.back);
//   };

//   // 📌 Add this new state
//   const [modifiedPhotos, setModifiedPhotos] = useState({});

//   // 📌 Update takePicture
//   const takePicture = async () => {
//     if (!cameraRef.current || !isCameraReady) return;

//     try {
//       const photo = await cameraRef.current.takePictureAsync({
//         quality: 0.2, // low for file size
//         skipProcessing: true,
//       });

//       const manipulated = await ImageManipulator.manipulateAsync(
//         photo.uri,
//         [],
//         {
//           compress: 0.2, // drop this more (0.2 instead of 0.3)
//           format: ImageManipulator.SaveFormat.JPEG,
//         }
//       );
//       setPhotos((prev) => ({ ...prev, [photoType]: manipulated.uri }));
//       setModifiedPhotos((prev) => ({ ...prev, [photoType]: manipulated.uri })); // ✅ Track modified
//     } catch (error) {
//       console.error("Error taking picture:", error);
//       Alert.alert("Error", "Failed to capture image");
//     } finally {
//       setIsCameraOpen(false);
//     }
//   };

//   const toggleCameraType = () => {
//     setCameraFacing((prev) =>
//       prev === cameraTypes.back ? cameraTypes.front : cameraTypes.back
//     );
//   };

//   const [cnicParts, setCnicParts] = useState({
//     part1: user?.verification?.identity?.cnicNumber.split("-")[0] || "",
//     part2: user?.verification?.identity?.cnicNumber.split("-")[1] || "",
//     part3: user?.verification?.identity?.cnicNumber.split("-")[2] || "",
//   });

//   const { mutateAsync: verifyIdentity, isPending } =
//     useVerifyProviderIdentity();

//   // 📌 Update handleSubmit
//   const handleSubmit = async () => {
//     const { part1, part2, part3 } = cnicParts;
//     const fullCnic = `${part1}-${part2}-${part3}`;
//     const formData = new FormData();

//     const appendFile = (uri, key) => {
//       if (!uri) return;
//       const fileName = uri.split("/").pop();
//       const mimeType = mime.getType(uri);
//       formData.append(key, {
//         uri,
//         name: fileName,
//         type: mimeType,
//       });
//     };

//     if (modifiedPhotos.selfie) appendFile(modifiedPhotos.selfie, "selfie");
//     if (modifiedPhotos.cnicFront)
//       appendFile(modifiedPhotos.cnicFront, "cnicFront");
//     if (modifiedPhotos.cnicBack)
//       appendFile(modifiedPhotos.cnicBack, "cnicBack");

//     formData.append("cnicNumber", fullCnic);

//     // ✋ If nothing modified
//     if (
//       !formData.has("selfie") &&
//       !formData.has("cnicFront") &&
//       !formData.has("cnicBack")
//     ) {
//       Alert.alert("No changes", "You haven't updated any photos.");
//       return;
//     }

//     try {
//       await verifyIdentity(formData);
//       setModifiedPhotos({}); // ✅ Reset after success
//     } catch (error) {
//       Alert.alert("Error", error?.message || "Something went wrong.");
//     }
//   };

//   if (hasPermission === false) {
//     return (
//       <View className="flex-1 items-center justify-center p-5">
//         <Text className="text-base text-gray-800 mb-4">
//           Camera access is required for identity verification
//         </Text>
//         <CustomButton
//           title="Request Camera Access"
//           handlePress={() => Camera.requestCameraPermissionsAsync()}
//           containerStyles="bg-primary w-full"
//         />
//       </View>
//     );
//   }

//   if (isLoading) {
//     return (
//       <View className="flex-1 items-center justify-center">
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <TabHeader title="Professional Information" goBack />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View className="p-5">
//           {/* Profile Photo */}
//           <View className="mb-6">
//             <View className="flex-row justify-between items-center mb-2">
//               <Text className="text-base font-pmedium text-text">
//                 Your Photo
//               </Text>
//               <Text className="text-red-500 font-pmedium">Not Verified</Text>
//             </View>
//             <View className="flex-row items-center space-x-3">
//               <View className="relative">
//                 <Image
//                   source={{
//                     uri: photos.selfie || "https://via.placeholder.com/100",
//                   }}
//                   className="w-24 h-24 rounded-full border border-gray-200"
//                 />
//                 <Pressable
//                   onPress={() => openCamera("selfie")}
//                   className="absolute bottom-0 right-0 bg-primary p-2 rounded-full"
//                 >
//                   <Ionicons name="camera" size={16} color="white" />
//                 </Pressable>
//               </View>
//               <Text className="text-gray-600 text-sm ml-4">
//                 {photos.selfie
//                   ? "Photo captured"
//                   : "Take a clear photo of your face"}
//               </Text>
//             </View>
//           </View>

//           {/* CNIC Number */}
//           <View className="mb-6">
//             <View className="flex-row justify-between items-center mb-2">
//               <Text className="text-base font-pmedium text-text">
//                 ID Card (CNIC) Number
//               </Text>
//               <Text className="text-red-500 font-pmedium">Not Verified</Text>
//             </View>
//             <View className="flex-row justify-between space-x-2">
//               <TextInput
//                 placeholder="xxxxx"
//                 value={cnicParts.part1}
//                 onChangeText={(text) =>
//                   setCnicParts({ ...cnicParts, part1: text })
//                 }
//                 className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-center"
//                 keyboardType="number-pad"
//                 maxLength={5}
//               />
//               <TextInput
//                 placeholder="xxxxxxx"
//                 value={cnicParts.part2}
//                 onChangeText={(text) =>
//                   setCnicParts({ ...cnicParts, part2: text })
//                 }
//                 className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-center"
//                 keyboardType="number-pad"
//                 maxLength={7}
//               />
//               <TextInput
//                 placeholder="x"
//                 value={cnicParts.part3}
//                 onChangeText={(text) =>
//                   setCnicParts({ ...cnicParts, part3: text })
//                 }
//                 className="w-12 border border-gray-300 rounded-xl px-3 py-2 text-center"
//                 keyboardType="number-pad"
//                 maxLength={1}
//               />
//             </View>
//           </View>

//           {/* CNIC Images */}
//           <View className="mb-6">
//             <Text className="text-base font-pmedium text-text mb-2">
//               CNIC Images
//             </Text>
//             <View className="space-y-4 gap-4">
//               {["cnicFront", "cnicBack"].map((side) => (
//                 <Pressable
//                   key={side}
//                   onPress={() => openCamera(side)}
//                   className="border border-gray-300 rounded-xl px-4 py-3 flex justify-center items-center"
//                 >
//                   {photos[side] ? (
//                     <Image
//                       source={{ uri: photos[side] }}
//                       className="w-full h-52 rounded-lg"
//                     />
//                   ) : (
//                     <View className="flex items-center">
//                       <Ionicons name="document" size={24} color="gray" />
//                       <Text className="text-gray-600 mt-2">
//                         Upload {side === "cnicFront" ? "Front" : "Back"} Side of
//                         CNIC
//                       </Text>
//                     </View>
//                   )}
//                 </Pressable>
//               ))}
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Footer Buttons */}
//       <View className="flex-row items-center justify-between p-5 border-t border-gray-200">
//         <CustomButton
//           title="Go Back"
//           handlePress={() => router.back()}
//           containerStyles="bg-secondary w-[48%]"
//           disabled={isPending}
//         />
//         <CustomButton
//           title="Update"
//           handlePress={handleSubmit}
//           containerStyles="bg-primary w-[48%]"
//           disabled={Object.keys(modifiedPhotos).length === 0 || isPending}
//           isLoading={isPending}
//         />
//       </View>

//       {/* Camera Modal */}
//       <Modal
//         visible={isCameraOpen}
//         animationType="slide"
//         onRequestClose={() => setIsCameraOpen(false)}
//         className="flex-1"
//       >
//         {hasPermission && isCameraOpen && (
//           <View className="flex-1 bg-black">
//             <CameraView
//               key={photoType}
//               style={{ flex: 1 }}
//               facing={cameraFacing}
//               ref={cameraRef}
//               onCameraReady={() => setIsCameraReady(true)}
//               ratio="1:1"
//             >
//               <View className="flex-1 justify-end items-center pb-8">
//                 <View className="flex-row items-center space-x-10 gap-4">
//                   <Pressable
//                     onPress={() => setIsCameraOpen(false)}
//                     className="p-3"
//                   >
//                     <Ionicons name="close" size={32} color="white" />
//                   </Pressable>
//                   <Pressable
//                     className="w-20 h-20 bg-white rounded-full border-4 border-gray-300"
//                     onPress={takePicture}
//                   />
//                   <Pressable onPress={toggleCameraType} className="p-3">
//                     <Ionicons name="camera-reverse" size={32} color="white" />
//                   </Pressable>
//                 </View>
//               </View>
//             </CameraView>
//           </View>
//         )}
//       </Modal>
//     </View>
//   );
// };

// export default IdentityVerification;
