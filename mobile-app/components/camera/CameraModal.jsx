import React, { useRef, useState } from "react";
import { Modal, View, Pressable } from "react-native";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

const CameraModal = ({
  visible,
  onClose,
  onPictureTaken,
  initialCameraType = "back",
  aspectRatio = "1:1",
}) => {
  const cameraRef = useRef(null);
  const [cameraFacing, setCameraFacing] = useState(initialCameraType);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const toggleCameraType = () => {
    setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.2,
        skipProcessing: true,
      });
      onPictureTaken(photo.uri);
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing={cameraFacing}
          ref={cameraRef}
          onCameraReady={() => setIsCameraReady(true)}
          ratio={aspectRatio}
        >
          <View className="flex-1 justify-end items-center pb-8">
            <View className="flex-row items-center space-x-10 gap-4">
              <Pressable onPress={onClose} className="p-3">
                <Ionicons name="close" size={32} color="white" />
              </Pressable>
              <Pressable
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300"
                onPress={takePicture}
              />
              <Pressable onPress={toggleCameraType} className="p-3">
                <Ionicons name="camera-reverse" size={32} color="white" />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

export default CameraModal;
