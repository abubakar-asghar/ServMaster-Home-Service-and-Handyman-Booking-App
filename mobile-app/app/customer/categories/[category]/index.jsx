import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState, useMemo, useRef } from "react";
import TabHeader from "../../../../components/ui/TabHeader";
import SearchBar from "../../../../components/ui/SearchBar";
import { useGetSubServicesByParent } from "../../../../hooks/useServices";
import {
  useGetFavoriteServices,
  useAddFavoriteService,
  useRemoveFavoriteService,
  useCheckFavoriteService,
} from "../../../../hooks/useCustomer";
import { icons } from "../../../../constants";
import { colors } from "../../../../constants/colors";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { customerRoutes } from "../../../../lib/routes";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonServiceItem = () => (
  <View className="py-5 mb-3 flex-row items-center justify-between bg-gray-50 rounded-xl px-5">
    <View className="flex-row items-center gap-5">
      <ShimmerPlaceholder
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
        }}
      />
      <View>
        <ShimmerPlaceholder
          style={{
            width: 180,
            height: 16,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <ShimmerPlaceholder
          style={{
            width: 120,
            height: 12,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
    <ShimmerPlaceholder
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
      }}
    />
  </View>
);

export default function ServiceDetail() {
  const { category } = useLocalSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch services and favorite services
  const {
    data: servicesData,
    error,
    isPending,
  } = useGetSubServicesByParent(category);
  const { data: favoriteServices } = useGetFavoriteServices();

  // Favorite mutations
  const { mutate: addFavorite } = useAddFavoriteService();
  const { mutate: removeFavorite } = useRemoveFavoriteService();

  // Check if service is favorite
  const isServiceFavorite = (serviceId) => {
    return favoriteServices?.data?.some((fav) => fav.service._id === serviceId);
  };

  const services = Array.isArray(servicesData?.data) ? servicesData.data : [];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredServices = useMemo(() => {
    if (!searchValue.trim()) return services;
    return services.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, services]);

  const handleToggleFavorite = (serviceId, isCurrentlyFavorite) => {
    if (isCurrentlyFavorite) {
      removeFavorite(serviceId);
    } else {
      addFavorite(serviceId);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "white",
        opacity: fadeAnim,
      }}
    >
      <TabHeader title="Services" goBack />

      {isPending ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 15,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Skeleton */}
          <ShimmerPlaceholder
            style={{
              width: "100%",
              height: 52,
              borderRadius: 12,
              marginBottom: 20,
            }}
          />

          {/* Service List Skeletons */}
          {[...Array(6)].map((_, index) => (
            <SkeletonServiceItem key={index} />
          ))}
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-8">
          <Image
            source={icons.error}
            className="w-20 h-20 mb-4"
            tintColor={colors.muted}
          />
          <Text className="text-lg font-psemibold text-gray-700 mb-2">
            Failed to load services
          </Text>
          <Text className="text-gray-500 text-center">
            Please check your connection and try again
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 15,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <SearchBar
              placeholder="Search services..."
              value={searchValue}
              onChangeText={setSearchValue}
              containerStyle={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            />
          </Animated.View>

          <View className="mt-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((item, idx) => {
                const isFavorite = isServiceFavorite(item._id);
                return (
                  <View key={item._id + idx} className="mb-3">
                    <Pressable
                      onPress={() =>
                        router.push(
                          customerRoutes.CUSTOMER_PROVIDERS_OF_SERVICE(
                            category,
                            item._id
                          )
                        )
                      }
                      className="py-4 flex-row items-center justify-between bg-gray-50 rounded-xl px-5 active:bg-gray-100"
                      android_ripple={{ color: colors.gray200 }}
                    >
                      <View className="flex-row items-center gap-5 flex-1">
                        <View className="bg-primary/10 p-2 rounded-full">
                          <Image
                            source={icons.repairingService}
                            className="w-6 h-6"
                            tintColor={colors.primary}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-psemibold text-gray-900">
                            {item.name}
                          </Text>
                          {item.description && (
                            <Text
                              className="text-sm text-gray-500 mt-1"
                              numberOfLines={2}
                            >
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View className="h-full justify-start gap-3">
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item._id, isFavorite);
                          }}
                          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                          <FontAwesome
                            name={isFavorite ? "heart" : "heart-o"}
                            size={20}
                            color={isFavorite ? colors.danger : colors.gray400}
                          />
                        </Pressable>
                      </View>
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <View className="items-center justify-center py-12">
                <Image
                  source={icons.search}
                  className="w-16 h-16 mb-4"
                  tintColor={colors.muted}
                />
                <Text className="text-lg font-psemibold text-gray-700 mb-1">
                  No results found
                </Text>
                <Text className="text-gray-500 text-center">
                  Try a different search term
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );
}
