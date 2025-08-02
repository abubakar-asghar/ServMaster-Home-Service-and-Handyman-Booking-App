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
import TabHeader from "../../../../components/ui/TabHeader";
import {
  useGetFavoriteServices,
  useRemoveFavoriteService,
} from "../../../../hooks/useCustomer";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../../../../constants/colors";
import { icons } from "../../../../constants";
import CustomButton from "../../../../components/ui/CustomButton";
import { router } from "expo-router";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { customerRoutes } from "../../../../lib/routes";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonServiceCard = () => (
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

const FavoriteServicesScreen = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, error, refetch } = useGetFavoriteServices();
  const { mutate: removeFavorite, isPending: isRemoving } =
    useRemoveFavoriteService();

  const favoriteServices = data?.data || [];

  const handleRemoveFavorite = (serviceId) => {
    removeFavorite(serviceId, {
      onSuccess: () => {
        setShowModal(false);
        refetch();
      },
    });
  };

  const renderItem = ({ item }) => (
    <ServiceCard
      service={item.service}
      onRemovePress={() => {
        setSelectedService(item.service._id);
        setShowModal(true);
      }}
    />
  );

  return (
    <View className="flex-1 bg-white">
      <TabHeader title="Favorite Services" goBack />

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        statusBarTranslucent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-80">
            <Text className="text-lg font-psemibold text-center mb-4">
              Remove from favorites?
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to remove this service from your favorites?
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
                handlePress={() => handleRemoveFavorite(selectedService)}
                containerStyles={"w-[48%] bg-red-600"}
                textStyles={"text-white"}
                isLoading={isRemoving}
              />
            </View>
          </View>
        </View>
      </Modal>

      {isLoading ? (
        <View className="p-5">
          {[...Array(4)].map((_, index) => (
            <SkeletonServiceCard key={index} />
          ))}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">
            Failed to load favorite services.
          </Text>
        </View>
      ) : favoriteServices.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <View className="items-center">
            <View className="bg-primary/10 p-6 rounded-full mb-5">
              <FontAwesome name="heart-o" size={40} color={colors.primary} />
            </View>
            <Text className="text-xl font-psemibold text-gray-800 mb-2">
              No favorite services yet
            </Text>
            <Text className="text-gray-500 text-center px-10">
              Save your services by tapping the heart icon
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={favoriteServices}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const ServiceCard = ({ service, onRemovePress }) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() =>
        router.push(
          customerRoutes.CUSTOMER_PROVIDERS_OF_SERVICE(
            service.parent_service,
            service._id
          )
        )
      }
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row flex-1">
          <View className="bg-primary/10 p-3 rounded-lg mr-4">
            <Image
              source={
                service?.icon ? { uri: service.icon } : icons.repairingService
              }
              className="w-10 h-10"
              tintColor={colors.primary}
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-lg font-psemibold text-gray-900"
              numberOfLines={1}
            >
              {service?.name}
            </Text>

            {service?.description && (
              <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                {service.description}
              </Text>
            )}

            {service?.parent_service?.name && (
              <View className="flex-row items-center mt-2">
                <FontAwesome
                  name="folder-open"
                  size={12}
                  color={colors.muted}
                />
                <Text className="text-gray-500 text-sm ml-1">
                  {service.parent_service.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onRemovePress();
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          className="ml-2"
        >
          <FontAwesome name="heart" size={24} color={colors.danger} />
        </Pressable>
      </View>
    </TouchableOpacity>
  );
};

export default FavoriteServicesScreen;
