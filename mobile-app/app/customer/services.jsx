import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../constants";
import { colors } from "../../constants/colors";

const serviceCategories = [
  {
    name: "AC Repair",
    iconKey: "acRepair",
    description: "Professional AC repair and maintenance services.",
  },
  {
    name: "Appliances Repair",
    iconKey: "appliancesRepair",
    description: "Installation and repair of household appliances.",
  },
  {
    name: "Cleaning",
    iconKey: "cleaning",
    description: "Residential and commercial cleaning services.",
  },
  {
    name: "Countertop",
    iconKey: "countertop",
    description: "Expert countertop fitting for kitchens and bathrooms.",
  },
  {
    name: "Doors",
    iconKey: "doors",
    description: "Door repair, fitting and replacement services.",
  },
  {
    name: "Garage",
    iconKey: "garage",
    description: "Garage installation, repair, and organization.",
  },
  {
    name: "Gardening",
    iconKey: "gardening",
    description: "Garden setup, maintenance, and planting services.",
  },
  {
    name: "Lawn",
    iconKey: "lawn",
    description: "Lawn mowing, seeding, and care services.",
  },
  {
    name: "Painting",
    iconKey: "painting",
    description: "Interior and exterior painting services.",
  },
  {
    name: "Plumbing",
    iconKey: "plumbing",
    description: "Leak repairs, pipe installation and more.",
  },
  {
    name: "Renovation",
    iconKey: "renovation",
    description: "Home renovation and remodeling projects.",
  },
  {
    name: "Roof",
    iconKey: "roof",
    description: "Roof inspection, repair, and replacement services.",
  },
];

const ServicesCategories = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <View className="px-5 flex-row items-center justify-start mb-5 bg-primary" style={{paddingVertical: 15}}>
          <Text className="text-2xl text-center text-white font-psemibold">
            Services
          </Text>
        </View>
        <View className="px-5 flex-row flex-wrap justify-center items-center gap-5">
          {serviceCategories.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              className="items-center justify-center"
              onPress={() => {
                console.log(`Selected Service: ${item.name}`);
              }}
            >
              <View className="w-20 h-20 items-center justify-center bg-muted-100 p-4 rounded-full">
                <Image
                  source={icons[item.iconKey]}
                  resizeMode="contain"
                  className="w-12 h-12"
                  tintColor={colors.primary}
                />
              </View>
              <Text
                numberOfLines={1}
                className="text-xs text-center w-20 text-black font-pregular mt-2"
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServicesCategories;
