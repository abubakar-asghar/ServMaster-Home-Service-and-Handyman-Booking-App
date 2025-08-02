import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import TabHeader from "../../../../components/ui/TabHeader";
import CustomButton from "../../../../components/ui/CustomButton";
import {
  useGetFavoriteProviders,
  useRemoveFavoriteProvider,
} from "../../../../hooks/useCustomer";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../constants/colors";
import { router } from "expo-router";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { customerRoutes } from "../../../../lib/routes";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonProviderCard = () => (
  <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
    <View className="flex-row justify-between items-start">
      <View className="flex-row flex-1">
        <ShimmerPlaceholder
          style={{ width: 64, height: 64, borderRadius: 12 }}
        />

        <View className="flex-1 ml-4">
          <ShimmerPlaceholder
            style={{
              width: "70%",
              height: 20,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <ShimmerPlaceholder
            style={{
              width: "50%",
              height: 16,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <ShimmerPlaceholder
            style={{ width: "60%", height: 16, borderRadius: 4 }}
          />
        </View>
      </View>

      <ShimmerPlaceholder style={{ width: 24, height: 24, borderRadius: 12 }} />
    </View>

    <View className="flex-row mt-4">
      <ShimmerPlaceholder
        style={{ width: 80, height: 24, borderRadius: 12, marginRight: 8 }}
      />
      <ShimmerPlaceholder
        style={{ width: 100, height: 24, borderRadius: 12 }}
      />
    </View>
  </View>
);

const FavoriteProvidersScreen = () => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isPending, error, refetch } = useGetFavoriteProviders();
  const { mutate: removeFavorite, isPending: isRemoving } =
    useRemoveFavoriteProvider();

  const favoriteProviders = data?.data || [];

  const handleRemoveFavorite = async (providerId) => {
    removeFavorite(providerId, {
      onSuccess: (res) => {
        setShowModal(false);
        refetch();
      },
    });
  };

  const renderItem = ({ item }) => (
    <ProviderCard
      favoriteId={item._id}
      provider={item.provider}
      onRemovePress={() => {
        setSelectedProvider(item.provider._id);
        setShowModal(true);
      }}
    />
  );

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title="Favorite Providers" goBack />

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        statusBarTranslucent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-[85%]">
            <View className="items-center mb-4">
              <Ionicons name="heart-dislike" size={32} color={colors.danger} />
              <Text className="text-xl font-psemibold text-center mt-3">
                Remove from favorites?
              </Text>
            </View>
            <Text className="text-gray-600 text-center mb-6 px-2">
              Are you sure you want to remove this provider from your favorites
              list?
            </Text>
            <View className="flex-row justify-between space-x-3">
              <CustomButton
                title="Cancel"
                handlePress={() => setShowModal(false)}
                containerStyles={"w-[48%] bg-white border border-gray-300"}
                textStyles={"text-gray-700"}
                disabled={isRemoving}
              />
              <CustomButton
                title="Yes, Remove"
                handlePress={() => handleRemoveFavorite(selectedProvider)}
                containerStyles={"w-[48%] bg-red-600"}
                textStyles={"text-white"}
                isLoading={isRemoving}
              />
            </View>
          </View>
        </View>
      </Modal>

      {isPending ? (
        <View className="p-5">
          {[...Array(4)].map((_, index) => (
            <SkeletonProviderCard key={index} />
          ))}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="warning" size={48} color={colors.danger} />
          <Text className="text-lg font-psemibold text-gray-700 mt-4 mb-2">
            Failed to load favorites
          </Text>
          <Text className="text-gray-500 text-center">
            Please check your connection and try again
          </Text>
          <Pressable
            className="mt-6 bg-primary rounded-xl px-6 py-3"
            onPress={() => refetch()}
          >
            <Text className="text-white font-pmedium">Retry</Text>
          </Pressable>
        </View>
      ) : favoriteProviders.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <View className="items-center">
            <View className="bg-primary/10 p-6 rounded-full mb-5">
              <FontAwesome name="heart-o" size={40} color={colors.primary} />
            </View>
            <Text className="text-xl font-psemibold text-gray-800 mb-2">
              No favorite providers yet
            </Text>
            <Text className="text-gray-500 text-center px-10">
              Save your favorite providers by tapping the heart icon on their
              profiles
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={favoriteProviders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const ProviderCard = ({ provider, onRemovePress }) => {
  // Get primary service if available
  const primaryService =
    provider?.selectedServices?.[0]?.services?.[0]?.service?.name ||
    "Service Provider";

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 active:bg-gray-50"
      activeOpacity={0.9}
      onPress={() =>
        router.push(customerRoutes.CUSTOMER_PROVIDER_PROFILE(provider._id))
      }
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row flex-1">
          <Image
            source={{
              uri: provider?.profileImage || "https://via.placeholder.com/100",
            }}
            className="w-16 h-16 rounded-xl mr-4"
          />

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className="text-lg font-psemibold text-gray-900 flex-1"
                numberOfLines={1}
              >
                {provider?.fullName}
              </Text>
              {provider?.onlineStatus === "online" && (
                <View className="flex-row items-center ml-2 bg-green-50 px-2 py-1 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                  <Text className="text-green-700 text-xs font-pmedium">
                    Online
                  </Text>
                </View>
              )}
            </View>

            {provider?.businessInfo?.name && (
              <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
                {provider.businessInfo.name}
              </Text>
            )}

            <View className="flex-row items-center mt-2">
              <FontAwesome name="circle" size={8} color={colors.primary} />
              <Text className="text-primary text-sm ml-2" numberOfLines={1}>
                {primaryService}
              </Text>
            </View>

            <View className="flex-row items-center mt-3">
              <View className="flex-row items-center">
                <FontAwesome name="star" size={14} color="#FFD700" />
                <Text className="text-gray-600 text-sm ml-1">
                  {provider.rating?.average?.toFixed(1) || "0.0"}
                </Text>
                <Text className="text-gray-400 text-sm ml-1">
                  ({provider.rating?.count || 0})
                </Text>
              </View>

              {provider.businessInfo?.city && (
                <View className="flex-row items-center ml-4">
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color={colors.muted}
                  />
                  <Text className="text-gray-500 text-sm ml-1">
                    {provider.businessInfo.city}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onRemovePress();
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          className="ml-2 p-2"
        >
          <FontAwesome name="heart" size={24} color={colors.danger} />
        </Pressable>
      </View>

      <View className="flex-row mt-4 flex-wrap">
        {provider?.verification?.identity?.status === "verified" && (
          <View className="bg-green-50 rounded-full px-3 py-1 flex-row items-center mr-2 mb-2">
            <FontAwesome name="check-circle" size={12} color={colors.success} />
            <Text className="text-success text-xs font-pmedium ml-1">
              ID Verified
            </Text>
          </View>
        )}

        {provider?.verification?.professional?.status === "verified" && (
          <View className="bg-blue-50 rounded-full px-3 py-1 flex-row items-center mr-2 mb-2">
            <FontAwesome name="certificate" size={12} color={colors.primary} />
            <Text className="text-primary text-xs font-pmedium ml-1">
              Professional
            </Text>
          </View>
        )}

        {provider?.businessInfo?.hasPhysicalShop && (
          <View className="bg-purple-50 rounded-full px-3 py-1 flex-row items-center mr-2 mb-2">
            <Ionicons name="business" size={12} color={colors.secondary} />
            <Text className="text-secondary text-xs font-pmedium ml-1">
              Physical Shop
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default FavoriteProvidersScreen;
