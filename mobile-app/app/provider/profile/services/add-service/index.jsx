import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { router } from "expo-router";
import { icons } from "../../../../../constants";
import SearchBar from "../../../../../components/ui/SearchBar";
import { useGetServiceCategories } from "../../../../../hooks/useServices";
import TabHeader from "../../../../../components/ui/TabHeader";
import { colors } from "../../../../../constants/colors";
import { providerRoutes } from "../../../../../lib/routes";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonCategoryCard = () => (
  <View className="w-[47%] mb-4 items-center">
    <ShimmerPlaceholder
      style={{
        width: "100%",
        height: 130,
        borderRadius: 12,
        marginBottom: 8,
      }}
    />
    <ShimmerPlaceholder style={{ width: 80, height: 14, borderRadius: 6 }} />
  </View>
);

const ServicesCategoriesToAdd = () => {
  const { data, error, isPending } = useGetServiceCategories();
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setCategories(data?.data || []);
  }, [data]);

  const filteredCategories = useMemo(() => {
    if (!searchValue.trim()) return categories;

    return categories.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, categories]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="Categories" goBack />

      {/* Services Grid */}
      {isPending ? (
        <ScrollView
          contentContainerStyle={{ backgroundColor: "white" }}
          className="p-5"
        >
          <View className="mb-6">
            <ShimmerPlaceholder
              style={{ width: "100%", height: 56, borderRadius: 12 }}
            />
          </View>

          <View className="flex-row flex-wrap justify-between mt-2">
            {[...Array(6)].map((_, idx) => (
              <SkeletonCategoryCard key={`skeleton-${idx}`} />
            ))}
          </View>
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-red-500">Failed to load categories.</Text>
        </View>
      ) : filteredCategories.length === 0 ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-gray-500">No categories available.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: "white",
          }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* 🔍 Search Input */}
          <View className="mt-5">
            <SearchBar
              placeholder="Search categories..."
              value={searchValue}
              onChangeText={setSearchValue}
            />
          </View>

          <View className="flex-row flex-wrap justify-between mt-7">
            {filteredCategories.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  router.push(providerRoutes.PROVIDER_ADD_SERVICES(item._id));
                }}
                className="w-[47%] mb-4 items-center rounded-xl"
              >
                <View className="w-full h-32 items-center justify-center bg-muted-light shadow-md shadow-gray-400 p-4 rounded-xl">
                  <Image
                    source={{
                      uri:
                        item.icon ||
                        "https://res.cloudinary.com/abubakarmalik/image/upload/v1751765416/mechanic_nvpheo.png",
                    }}
                    resizeMode="contain"
                    className="w-16 h-16"
                    tintColor={colors.primary}
                  />
                </View>
                <View className="mt-2">
                  {/* <MarqueeText text={item.name} width={150} /> */}
                  <Text className="text-sm text-text text-center font-pmedium">
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ServicesCategoriesToAdd;
