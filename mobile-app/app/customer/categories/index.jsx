import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../../constants";
import { colors } from "../../../constants/colors";
import { useRouter } from "expo-router";
import TabHeader from "../../../components/ui/TabHeader";
import { useGetServiceCategories } from "../../../hooks/useServices";
import SearchBar from "../../../components/ui/SearchBar";

// const MarqueeText = ({ text, width = 150 }) => {
//   const animatedValue = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(animatedValue, {
//         toValue: -width, // move left
//         duration: 5000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, []);

//   return (
//     <View style={{ width, overflow: "hidden", height: 16 }}>
//       <Animated.Text
//         style={{
//           transform: [{ translateX: animatedValue }],
//           width: width * 2, // so it keeps scrolling
//           fontSize: 12,
//           color: "black",
//         }}
//         numberOfLines={1}
//       >
//         {text} {text}
//       </Animated.Text>
//     </View>
//   );
// };

const ServicesCategories = () => {
  const router = useRouter();

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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="Categories" />

      {/* Services Grid */}
      <View className="flex-1 bg-white">
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
              placeholder="Search services..."
              value={searchValue}
              onChangeText={setSearchValue}
            />
          </View>
          
          {isPending && (
            <View className="flex-1 items-center justify-center">
              <Text>Loading...</Text>
            </View>
          )}
          {error && (
            <View className="flex-1 items-center justify-center">
              <Text>Error: {error.message}</Text>
            </View>
          )}

          <View className="flex-row flex-wrap justify-between mt-7">
            {filteredCategories.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  router.push(`/customer/categories/${item._id}`);
                }}
                className="w-[47%] mb-4 items-center"
              >
                <View className="w-full h-32 items-center justify-center bg-muted-100 p-4 rounded-md">
                  <Image
                    source={icons[item.slug] || icons.acRepair}
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
      </View>
    </SafeAreaView>
  );
};

export default ServicesCategories;
