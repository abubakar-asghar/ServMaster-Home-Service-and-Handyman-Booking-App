import { View, Text, Image, Button } from "react-native";
import React from "react";
import CustomButton from "./ui/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import { icons, images } from "../constants";
import { colors } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const OnboardingStep = ({ step, title, image, bullets, onNext }) => {
  return (
    <SafeAreaView className="flex-1 h-screen py-6 justify-center items-center bg-white px-6">
      <Text className="text-xl text-secondary mt-8 font-pmedium">Welcome</Text>
      <View className="w-full flex-row items-center justify-center gap-2 mt-4">
        <Image
          source={images.logoTextH}
          className="w-full h-12"
          resizeMode="contain"
        />
      </View>
      <View className="relative w-full my-10">
        <Image
          source={image}
          className={`${step === 4 ? "h-64" : "h-48"} w-full`}
          resizeMode="contain"
        />
        <LinearGradient
          colors={["transparent", "white"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 15,
          }}
        />
      </View>
      <View className="flex-1 justify-start items-center">
        <Text className="text-2xl font-pbold mt-4 text-primary w-80 text-center">
          {title}
        </Text>
        <View className="w-full items-center mt-6 mb-6">
          {bullets && Array.isArray(bullets) ? (
            <View className="w-[250px] flex-row flex-wrap justify-between gap-x-6 items-center">
              {bullets.map((item, index) => (
                <View className="flex-row items-start" key={index}>
                  <Image
                    source={icons.doubleCheck}
                    className="w-4 h-4 mt-1.5 mr-2"
                    resizeMode="contain"
                    tintColor={colors.tabIconSelected}
                  />
                  <Text
                    key={index}
                    className="text-base text-text font-pmedium"
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="h-0 w-0"></View>
          )}
        </View>
      </View>
      <View className="w-full px-2">
        <CustomButton
          title={step !== 4 ? "Next" : "Start"}
          handlePress={onNext}
          containerStyles="bg-secondary rounded-xl min-h-[62px] flex flex-row justify-center items-center"
          textStyles="text-white font-psemibold text-lg"
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingStep;
