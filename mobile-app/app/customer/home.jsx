import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../../constants";
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

const CustomerHomePage = () => {
  return (
    <SafeAreaView>
      <ScrollView className="bg-white">
        <View className="bg-white">
          <View className="overflow-hidden bg-white">
            <View className="relative bg-white h-[300px] mb-[31px]">
              <TouchableOpacity className="absolute top-4 right-4 bg-muted-100 p-2 rounded-full z-10">
                <Image
                  source={icons.notification}
                  className="w-5 h-5"
                  resizeMode="contain"
                  tintColor={colors.primary}
                />
              </TouchableOpacity>
              <Image
                source={images.homeServices}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Location Search */}
            <View className="absolute left-0 bottom-0 flex-row w-full justify-between items-center gap-4 px-5 mt-4">
              <View className="flex-1 flex-row min-h-[62px] bg-muted-100 rounded-xl justify-center items-center gap-5 px-5">
                <Image
                  source={icons.location}
                  resizeMode="contain"
                  className="w-6 h-6"
                  tintColor={colors.primary}
                />
                <TextInput
                  placeholder="All services available"
                  className="flex-1 py-2 font-pregular"
                  placeholderTextColor={colors.muted}
                  style={{ color: colors.text }}
                />
                <Image
                  source={icons.aim}
                  resizeMode="contain"
                  className="w-6 h-6"
                  tintColor={colors.primary}
                />
              </View>
              <TouchableOpacity className="items-center justify-center bg-muted-100 min-h-[62px] min-w-[62px] rounded-xl p-2">
                <Image
                  source={icons.search}
                  resizeMode="contain"
                  className="w-6 h-6"
                  tintColor={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Services Rows */}
          <View className="bg-white">
            <View className="px-5 mt-6 flex-row justify-between items-center">
              <Text className="text-lg font-psemibold text-primary">
                Categories
              </Text>
              <TouchableOpacity>
                <Link
                  href={"/customer/services"}
                  className="text-muted font-pregular px-2"
                >
                  View All
                </Link>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4 px-5"
            >
              {serviceCategories.map((item, index) => (
                <View key={index} className="items-center justify-center mr-4">
                  <View className="w-20 h-20 items-center justify-center bg-muted-100 p-4 rounded-full mb-2">
                    <Image
                      source={icons[item.iconKey]}
                      resizeMode="contain"
                      className="w-10 h-10"
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-xs text-center w-20 text-black font-pregular"
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Featured Section Cards */}
          <View className="bg-gray-100 mt-4">
            <View className="px-5 flex-row mt-6 justify-between items-center">
              <Text className="text-lg font-psemibold text-primary">
                Featured
              </Text>
              <TouchableOpacity>
                <Text className="text-muted font-pregular px-2">View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-6 px-5 mb-6 mr-4"
            >
              <View className="mr-4">
                <View className="rounded-2xl overflow-hidden w-80 h-52 bg-white">
                  <Image
                    source={images.gardening}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-3 left-3 bg-muted-100 px-3 py-2 rounded-full text-xs font-psemibold text-black">
                    GARDENING
                  </Text>
                </View>
              </View>
              <View className="mr-4">
                <View className="rounded-2xl overflow-hidden w-80 h-52 bg-white">
                  <Image
                    source={images.cleaning}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-3 left-3 bg-muted-100 px-3 py-2 rounded-full text-xs font-psemibold text-black">
                    CLEANING
                  </Text>
                </View>
              </View>
              <View className="mr-4">
                <View className="rounded-2xl overflow-hidden w-80 h-52 bg-white">
                  <Image
                    source={images.solarInstallation}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-3 left-3 bg-muted-100 px-3 py-2 rounded-full text-xs font-psemibold text-black">
                    SOLAR INSTALLATION
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerHomePage;
