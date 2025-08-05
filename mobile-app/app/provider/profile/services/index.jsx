import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
  Image,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import TabHeader from "../../../../components/ui/TabHeader";
import SearchBar from "../../../../components/ui/SearchBar";
import CustomButton from "../../../../components/ui/CustomButton";
import { icons } from "../../../../constants";
import { router } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  useDeleteService,
  useGetServiceDetails,
  useUpdateService,
} from "../../../../hooks/useProvider";
import { colors } from "../../../../constants/colors";
import { providerRoutes } from "../../../../lib/routes";

const ProvidersServices = () => {
  const { user } = useSelector((state) => state.auth);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);

  const { mutateAsync: deleteService, isPending: isDeletionPending } =
    useDeleteService();
  const { mutateAsync: updateService, isPending: isEditionPending } =
    useUpdateService();
  const { mutateAsync: getServiceDetails, isPending: isGettingServiceDetail } =
    useGetServiceDetails();

  const handleServiceDeletion = async () => {
    try {
      await deleteService(serviceToDelete);
      setDeleteModal(false);
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to delete service.");
    }
  };

  const handleDeletePress = (serviceId) => {
    setServiceToDelete(serviceId);
    setDeleteModal(true);
  };

  const handleOpenEdit = (categoryId, serviceItem) => {
    setCurrentService({ ...serviceItem, categoryId });
    setEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await updateService(currentService);
      setEditModal(false);
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to update service.");
    }
  };

  const handleServicePress = async (serviceId) => {
    setDetailsModal(true);
    try {
      const response = await getServiceDetails(serviceId);
      setServiceDetails(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load service details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderReviewItem = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-3 shadow-md mx-5">
      <View className="flex-row justify-start items-center mb-3">
        {/* Profile Image */}
        <Image
          source={{ uri: item.customer.profileImage }} // assuming profileImage URL exists
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
        />
        {/* Customer Name and Rating */}
        <View className="flex-grow">
          <Text className="font-semibold text-lg">
            {item.customer.fullName}
          </Text>
          <View className="flex-row items-center">
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text className="ml-1 font-medium text-gray-700">
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Comment */}
      {item.comment && (
        <Text className="text-gray-600 mt-1 text-base">{item.comment}</Text>
      )}

      {/* Date */}
      <Text className="text-gray-400 text-xs mt-2">
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesome key="half" name="star-half-o" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesome
          key={`empty-${i}`}
          name="star-o"
          size={16}
          color="#FFD700"
        />
      );
    }

    return stars;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title={"My Services"} goBack />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="flex-1 pb-5">
          {/* Search and Add Button */}
          <View className="flex-row items-center justify-between gap-4 mt-5 px-5">
            <View className="flex-1">
              <SearchBar placeholder="Search Services" />
            </View>
            <CustomButton
              icon={<Ionicons name={"add"} size={20} color={colors.primary} />}
              containerStyles="bg-primary w-12 h-12 rounded-lg shadow-sm"
              iconStyles="text-white"
              handlePress={() =>
                router.push(providerRoutes.PROVIDER_CATEGORIES)
              }
            />
          </View>

          {/* Services List */}
          {user?.selectedServices?.length > 0 ? (
            user.selectedServices.map((item, index) => (
              <View key={index} className="mt-6">
                {/* Category Header */}
                <View className="px-5 py-3 bg-primary/10 border-l-4 border-primary">
                  <Text className="text-lg font-psemibold text-primary">
                    {item.category.name}
                  </Text>
                </View>

                {/* Services List */}
                <View className="px-5 mt-3 space-y-3">
                  {item.services.map((serviceItem, subIndex) => (
                    <Pressable
                      key={serviceItem.service._id + subIndex}
                      onPress={() =>
                        handleServicePress(serviceItem.service._id)
                      }
                    >
                      <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        {/* Header Row with Availability Pill */}
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="text-lg font-psemibold text-gray-800 flex-1 pr-2">
                            {serviceItem.service.name}
                          </Text>

                          {/* Improved Availability Badge - now with icon */}
                          <View className="flex-row items-center">
                            <View
                              className={`flex-row items-center px-3 py-1 rounded-full ${
                                serviceItem.available
                                  ? "bg-green-50 border border-green-100"
                                  : "bg-gray-50 border border-gray-100"
                              }`}
                            >
                              <Ionicons
                                name={
                                  serviceItem.available
                                    ? "checkmark-circle"
                                    : "close-circle"
                                }
                                size={14}
                                color={
                                  serviceItem.available
                                    ? colors.success
                                    : colors.muted
                                }
                                style={{ marginRight: 4 }}
                              />
                              <Text
                                className={`text-xs font-pmedium ${
                                  serviceItem.available
                                    ? "text-green-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {serviceItem.available
                                  ? "Available"
                                  : "Unavailable"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Content Section */}
                        <View className="flex-row justify-between">
                          <View className="flex-1">
                            {/* Rating Display */}
                            {serviceItem.rating?.count > 0 && (
                              <View className="flex-row items-center mb-2">
                                <View className="flex-row mr-1">
                                  {renderRatingStars(
                                    serviceItem.rating.average || 0
                                  )}
                                </View>
                                <Text className="text-sm font-psemibold text-primary ml-1">
                                  {serviceItem.rating.average.toFixed(1)}
                                </Text>
                                <Text className="text-xs text-gray-500 ml-1">
                                  ({serviceItem.rating.count})
                                </Text>
                              </View>
                            )}

                            {/* Pricing Information */}
                            <View className="flex-row items-center">
                              <View className="bg-blue-50 rounded-full p-1 mr-2">
                                <Ionicons
                                  name="pricetag-outline"
                                  size={14}
                                  color={colors.primary}
                                />
                              </View>
                              <Text className="text-sm font-pmedium text-gray-500">
                                {serviceItem?.pricing?.amount
                                  ? `Rs. ${serviceItem.pricing.amount}`
                                  : "Negotiable"}
                                {serviceItem.pricing.type !== "negotiable" && (
                                  <Text className="text-xs text-gray-400 ml-1">
                                    (
                                    {serviceItem.pricing.type.replace("_", " ")}
                                    )
                                  </Text>
                                )}
                              </Text>
                            </View>
                          </View>

                          {/* Action Buttons - now with better spacing */}
                          <View className="flex-row space-x-2">
                            <Pressable
                              className="w-10 h-10 items-center justify-center bg-white rounded-lg border border-gray-200 shadow-xs hover:bg-gray-50"
                              onPress={() =>
                                handleOpenEdit(item.category._id, {
                                  ...serviceItem,
                                  serviceId: serviceItem.service._id,
                                })
                              }
                            >
                              <Ionicons
                                name="create-outline"
                                size={18}
                                color={colors.primary}
                              />
                            </Pressable>
                            <Pressable
                              className="w-10 h-10 items-center justify-center bg-white rounded-lg border border-red-200 shadow-xs hover:bg-red-50"
                              onPress={() =>
                                handleDeletePress(serviceItem.service._id)
                              }
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color={colors.danger}
                              />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <View className="bg-white p-6 rounded-xl shadow-sm items-center">
                <Ionicons
                  name="briefcase-outline"
                  size={40}
                  color={colors.muted}
                />
                <Text className="text-gray-500 text-lg font-pmedium mt-3">
                  No services added yet
                </Text>
                <CustomButton
                  title="Add Your First Service"
                  containerStyles="mt-4 bg-primary px-6 py-2 rounded-lg"
                  textStyles="text-white font-pmedium"
                  handlePress={() =>
                    router.push(providerRoutes.PROVIDER_CATEGORIES)
                  }
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Service Details Modal */}
      <Modal
        visible={detailsModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setDetailsModal(false)}
      >
        <View className="flex-1 bg-black/70 items-center justify-center p-4">
          <View className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-xl">
            {/* Header */}
            <View className="bg-primary/10 p-5 flex-row justify-between items-center border-b border-gray-100">
              <Text className="text-2xl font-psemibold text-gray-900">
                Service Details
              </Text>
              <Pressable
                onPress={() => setDetailsModal(false)}
                className="p-2 rounded-full bg-white shadow-sm"
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            {isGettingServiceDetail ? (
              <View className="h-64 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="max-h-[70vh]"
              >
                {serviceDetails && (
                  <View className="p-5">
                    {/* Service Header with Profile */}
                    <View className="flex-row items-start mb-5">
                      {serviceDetails.icon ? (
                        <Image
                          source={{ uri: serviceDetails.icon }}
                          className="w-14 h-14 rounded-xl mr-3"
                          tintColor={colors.primary}
                        />
                      ) : (
                        <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <Ionicons
                            name="person"
                            size={24}
                            color={colors.muted}
                          />
                        </View>
                      )}

                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-xl font-psemibold flex-1 text-primary">
                            {serviceDetails.name}
                          </Text>
                          <View
                            className={`flex-row items-center px-3 py-1 rounded-full ${
                              serviceDetails.available
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <Ionicons
                              name={
                                serviceDetails.available
                                  ? "checkmark-circle"
                                  : "close-circle"
                              }
                              size={14}
                              color={
                                serviceDetails.available
                                  ? colors.success
                                  : colors.muted
                              }
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              className={`text-xs font-pmedium ${
                                serviceDetails.available
                                  ? "text-green-800"
                                  : "text-gray-600"
                              }`}
                            >
                              {serviceDetails.available
                                ? "Available"
                                : "Unavailable"}
                            </Text>
                          </View>
                        </View>

                        {serviceDetails.provider?.businessInfo?.name && (
                          <Text className="text-gray-600 font-pmedium">
                            {serviceDetails.provider.businessInfo.name}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Description Card */}
                    <View className="bg-gray-50 p-4 rounded-xl mb-5">
                      <Text className="font-psemibold text-gray-700 mb-1">
                        Description
                      </Text>
                      <Text className="text-gray-600">
                        {serviceDetails.description ||
                          "No description provided"}
                      </Text>
                    </View>

                    {/* Pricing & Rating Card */}
                    <View className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs mb-5">
                      <View className="flex-row justify-between">
                        <View>
                          <Text className="font-pmedium text-gray-500 mb-1">
                            Pricing
                          </Text>
                          <View className="flex-row items-center">
                            <Text className="text-lg font-psemibold text-green-600">
                              {serviceDetails.pricing?.amount
                                ? `Rs. ${serviceDetails.pricing.amount}`
                                : "Negotiable"}
                            </Text>
                            {serviceDetails.pricing?.type &&
                              serviceDetails.pricing.type !== "negotiable" && (
                                <Text className="text-xs text-gray-500 ml-2 capitalize">
                                  (
                                  {serviceDetails.pricing.type.replace(
                                    "_",
                                    " "
                                  )}
                                  )
                                </Text>
                              )}
                          </View>
                        </View>

                        {serviceDetails.rating && (
                          <View>
                            <Text className="font-pmedium text-gray-500 mb-1">
                              Rating
                            </Text>
                            <View className="flex-row items-center">
                              <View className="flex-row mr-1">
                                {renderRatingStars(
                                  serviceDetails.rating.average || 0
                                )}
                              </View>
                              <Text className="font-psemibold text-primary">
                                {serviceDetails.rating.average.toFixed(1)}
                              </Text>
                              <Text className="text-xs text-gray-500 ml-1">
                                ({serviceDetails.rating.count})
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Reviews Section */}
                    <Text className="text-lg font-psemibold mb-3">
                      Customer Reviews
                    </Text>

                    {serviceDetails.reviews.length > 0 ? (
                      <View className="space-y-4">
                        {/* Fixed height ScrollView for reviews */}
                        <ScrollView
                          className="max-h-[280px]" // This height shows about 2-3 reviews
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled={true}
                        >
                          {serviceDetails.reviews.map((review) => (
                            <View
                              key={review._id}
                              className="bg-gray-50 w-full p-4 rounded-xl mb-3" // Added mb-3 for spacing between reviews
                            >
                              <View className="flex-row w-full items-center mb-2">
                                {review.customer?.profileImage ? (
                                  <Image
                                    source={{
                                      uri: review.customer.profileImage,
                                    }}
                                    className="w-10 h-10 rounded-full mr-3"
                                  />
                                ) : (
                                  <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                                    <Ionicons
                                      name="person"
                                      size={16}
                                      color={colors.muted}
                                    />
                                  </View>
                                )}
                                <View className="flex-1">
                                  <View className="flex-row flex-1 items-center justify-between">
                                    <Text className="font-psemibold">
                                      {review.customer?.fullName || "Anonymous"}
                                    </Text>
                                    <Pressable
                                      onPress={() =>
                                        router.push(
                                          providerRoutes.PROVIDER_BOOKING_DETAILS(
                                            review.service_request
                                          )
                                        )
                                      }
                                    >
                                      <Text className="text-primary font-psemibold">
                                        #
                                        {review.service_request
                                          .slice(-6)
                                          .toUpperCase()}
                                      </Text>
                                    </Pressable>
                                  </View>
                                  <View className="flex-row items-center">
                                    {renderRatingStars(review.rating, 14)}
                                    <Text className="text-xs text-gray-500 ml-1">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <Text className="text-gray-700">
                                {review.comment}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    ) : (
                      <View className="bg-gray-50 p-6 rounded-xl items-center justify-center">
                        <Ionicons
                          name="chatbox-ellipses-outline"
                          size={36}
                          color={colors.muted}
                        />
                        <Text className="text-gray-500 mt-3 font-pmedium">
                          No reviews yet for this service
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white w-full p-6 rounded-xl shadow-lg max-w-md">
            <Text className="text-xl font-psemibold text-primary text-center mb-4">
              Edit Service
            </Text>

            {/* Availability Toggle */}
            <View className="flex-row justify-between items-center mb-6 p-3 bg-gray-50 rounded-lg">
              <Text className="text-base font-pmedium text-gray-700">
                Service Availability
              </Text>
              <Switch
                value={currentService?.available ?? true}
                onValueChange={(value) =>
                  setCurrentService((prev) => ({
                    ...prev,
                    available: value,
                  }))
                }
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            {/* Pricing Type */}
            <Text className="text-base font-pmedium text-gray-700 mb-2">
              Pricing Type
            </Text>
            <View className="space-y-2 mb-4">
              {["negotiable", "fixed", "per_hour", "per_day"].map((type) => (
                <Pressable
                  key={type}
                  onPress={() =>
                    setCurrentService((prev) => ({
                      ...prev,
                      pricing: { ...prev.pricing, type },
                    }))
                  }
                  className={`flex-row items-center p-3 rounded-lg border ${
                    currentService?.pricing?.type === type
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full mr-3 border-2 ${
                      currentService?.pricing?.type === type
                        ? "bg-primary border-primary"
                        : "border-gray-300"
                    }`}
                  />
                  <Text className="capitalize text-gray-800 font-pmedium">
                    {type.replace("_", " ")}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Price Input */}
            {currentService?.pricing?.type !== "negotiable" && (
              <View className="mb-4">
                <Text className="text-base font-pmedium text-gray-700 mb-2">
                  Price (PKR)
                </Text>
                <View className="relative">
                  <TextInput
                    value={currentService?.pricing?.amount?.toString()}
                    onChangeText={(text) =>
                      setCurrentService((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          amount: parseInt(text.replace(/[^0-9]/g, ""), 10),
                        },
                      }))
                    }
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-pregular"
                  />
                  <Text className="absolute right-3 top-3 text-gray-500 font-pregular">
                    Rs.
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mt-4 gap-3">
              <CustomButton
                title="Cancel"
                containerStyles="flex-1 bg-gray-100 border border-gray-200"
                textStyles="text-text"
                handlePress={() => setEditModal(false)}
              />
              <CustomButton
                title="Save Changes"
                containerStyles="flex-1 bg-primary"
                handlePress={handleEditSave}
                isLoading={isEditionPending}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white w-full p-6 rounded-xl shadow-lg max-w-md">
            <View className="items-center mb-4">
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={colors.danger}
              />
            </View>
            <Text className="text-xl font-psemibold text-center text-gray-800 mb-2">
              Confirm Deletion
            </Text>
            <Text className="text-base font-pregular text-gray-600 text-center mb-6">
              Are you sure you want to delete this service? This action cannot
              be undone.
            </Text>

            <View className="flex-row space-x-3 gap-3">
              <CustomButton
                title="Cancel"
                containerStyles="flex-1 bg-gray-100 border border-gray-200"
                textStyles="text-text"
                handlePress={() => setDeleteModal(false)}
              />
              <CustomButton
                title="Delete"
                containerStyles="flex-1 bg-red-500"
                handlePress={handleServiceDeletion}
                isLoading={isDeletionPending}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProvidersServices;
