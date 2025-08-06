import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import TabHeader from "../../../../../components/ui/TabHeader";
import { images, icons } from "../../../../../constants";
import { colors } from "../../../../../constants/colors";
import { useGetProviderProfileForCustomer } from "../../../../../hooks/useProvider";
import {
  FontAwesome,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import {
  setBookingInfo,
  setProviderInfo,
  setServiceInfo,
} from "../../../../../store/slices/bookingSlice";
import ProfileImage from "../../../../../components/profile/ProfileImage";
import {
  useAddFavoriteProvider,
  useCheckFavoriteProvider,
  useRemoveFavoriteProvider,
} from "../../../../../hooks/useCustomer";
import { customerRoutes } from "../../../../../lib/routes";
import { useNavigationHistory } from "../../../../../hooks/useNavigationHistory";
// import { useAddToFavorites, useRemoveFromFavorites, useCheckFavorite } from "../../../../../hooks/useFavorites";

// Dummy reviews data
const dummyReviews = [
  {
    _id: "1",
    customer_id: {
      fullName: "Ali Khan",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    rating: 5,
    review:
      "Excellent service! The provider was punctual and did a great job fixing my AC.",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    _id: "2",
    customer_id: {
      fullName: "Sara Ahmed",
      profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    rating: 4,
    review:
      "Good work but arrived a bit late. Overall satisfied with the quality.",
    createdAt: "2023-06-20T14:45:00Z",
  },
  {
    _id: "3",
    customer_id: {
      fullName: "Usman Malik",
      profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    rating: 5,
    review: "Highly recommended! Fixed my plumbing issue in no time.",
    createdAt: "2023-07-10T09:15:00Z",
  },
];

export default function ProviderProfileForCustomer() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [isFavorite, setIsFavorite] = useState(false);
  const { providerId } = useGlobalSearchParams();
  const { push } = useNavigationHistory();
  const { data, isPending, error } =
    useGetProviderProfileForCustomer(providerId);

  // Inside your component function, add these hooks before the return statement
  const { mutateAsync: addFavorite, isPending: isAddingFavorite } =
    useAddFavoriteProvider();
  const { mutateAsync: removeFavorite, isPending: isRemovingFavorite } =
    useRemoveFavoriteProvider();
  const { data: favoriteData, isPending: isCheckingFavorite } =
    useCheckFavoriteProvider(providerId);

  useEffect(() => {
    if (favoriteData) {
      setIsFavorite(favoriteData.isFavorite);
    }
  }, [favoriteData]);

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(providerId);
      } else {
        await addFavorite(providerId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const provider = data?.data || {};

  const formatPricing = (pricing) => {
    if (!pricing) return "Price not specified";
    if (pricing.type === "negotiable") return "Price: Negotiable";
    return `Price: Rs. ${pricing.amount} ${
      pricing.type === "per_day"
        ? "/day"
        : pricing.type === "per_hour"
        ? "/hr"
        : ""
    }`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return colors.success;
      case "verified":
        return colors.primary;
      case "suspended":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const handleBookNow = (srv) => {
    console.log("SRV: ", srv, "provider: ", provider);
    dispatch(
      setBookingInfo({
        service: srv.service._id,
        service_provider: provider._id,
      })
    );
    dispatch(
      setServiceInfo({
        name: srv.service.name,
        icon:
          srv.service.parent_service?.icon ||
          srv.service.icon ||
          "https://res.cloudinary.com/abubakarmalik/image/upload/v1752941407/repairing-service_uackz4.png",
        pricing: srv.pricing,
      })
    );
    dispatch(
      setProviderInfo({
        coordinates: {
          longitude: provider.location?.coordinates[0] || 0,
          latitude: provider.location?.coordinates[1] || 0,
        },
        serviceArea: {
          type: provider.serviceArea.type || "radius",
          area:
            provider.serviceArea.type === "radius"
              ? provider.serviceArea.radiusInMeters.toString()
              : provider.serviceArea.type === "country"
              ? "Pakistan"
              : provider.serviceArea.type === "cities" ||
                provider.serviceArea.type === "states"
              ? provider.serviceArea[provider.serviceArea.type.toString()]
              : "5000",
        },
      })
    );
    const slug = srv.service._id + "-" + provider._id;
    push(pathname);
    router.push(customerRoutes.CUSTOMER_BOOK_SERVICE_STEP1(slug));
  };

  const renderContactButton = ({ phone }) => (
    <TouchableOpacity
      className="flex-row items-center justify-center bg-primary rounded-lg p-3 mt-4"
      // onPress={() => router.push(`/contact/${providerId}`)}
    >
      <FontAwesome name="whatsapp" size={20} color="white" />
      <Text className="text-white font-psemibold ml-2">Contact Provider</Text>
    </TouchableOpacity>
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

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return "";

    try {
      const [hours, minutes] = timeString.split(":");
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? "PM" : "AM";
      const hour12 = hourNum % 12 || 12;

      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString; // fallback to original if parsing fails
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title="Provider Profile" goBack />

      {isPending ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="mt-2 text-gray-500">Loading profile...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-10">
          <MaterialIcons name="error-outline" size={24} color={colors.error} />
          <Text className="text-red-500 mt-2">
            Failed to load provider profile
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View className="bg-white pb-6 pt-4 px-5 shadow-sm">
            <View className="flex-row items-start">
              <ProfileImage image={provider.profileImage} />

              <View className="ml-4 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xl font-psemibold text-text flex-1">
                    {provider.fullName}
                  </Text>

                  {/* Heart Icon for Favorites */}
                  {isCheckingFavorite ? (
                    <View className="ml-2 mr-2">
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : isAddingFavorite ? (
                    <View className="ml-2 mr-2">
                      <FontAwesome
                        name={"heart"}
                        size={24}
                        color={colors.danger}
                      />
                    </View>
                  ) : isRemovingFavorite ? (
                    <View className="ml-2 mr-2">
                      <FontAwesome
                        name={"heart-o"}
                        size={24}
                        color={colors.text}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleFavoriteToggle}
                      className="ml-2 mr-2"
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                      <FontAwesome
                        name={isFavorite ? "heart" : "heart-o"}
                        size={24}
                        color={isFavorite ? colors.danger : colors.text}
                      />
                    </TouchableOpacity>
                  )}

                  <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                    <View
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          provider.onlineStatus === "online"
                            ? colors.success
                            : colors.error,
                      }}
                    />
                    <Text className="text-xs text-gray-600 capitalize">
                      {provider.onlineStatus || "offline"}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-gray-500 mt-1">
                  {provider.businessInfo?.name || "Independent Professional"}
                </Text>

                <View className="flex-row items-center mt-2">
                  {renderRatingStars(provider.rating?.average || 0)}
                  <Text className="text-sm text-gray-600 ml-2">
                    ({provider.rating?.count || 0} reviews)
                  </Text>
                </View>

                <View className="flex-row items-center mt-2">
                  <Ionicons
                    name="location-sharp"
                    size={16}
                    color={colors.primary}
                  />
                  <Text className="text-sm text-gray-600 ml-1">
                    {provider.businessInfo?.city || "Location not specified"}
                  </Text>
                </View>
              </View>
            </View>

            {renderContactButton(provider.phone)}
          </View>

          {/* Key Information Cards */}
          <View className="px-5 mt-4">
            <View className="flex-row justify-between mb-4">
              <View className="bg-white p-4 rounded-lg shadow-sm flex-1 mr-2">
                <View className="flex-row items-center mb-2">
                  <FontAwesome5
                    name="user-check"
                    size={16}
                    color={colors.primary}
                  />
                  <Text className="text-sm font-pmedium text-gray-600 ml-2">
                    Verification
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{
                      backgroundColor: getStatusColor(
                        provider.verification?.identity?.status
                      ),
                    }}
                  />
                  <Text className="text-sm capitalize">
                    {provider.verification?.identity?.status || "Not verified"}
                  </Text>
                </View>
              </View>

              <View className="bg-white p-4 rounded-lg shadow-sm flex-1 ml-2">
                <View className="flex-row items-center mb-2">
                  <FontAwesome
                    name="briefcase"
                    size={16}
                    color={colors.primary}
                  />
                  <Text className="text-sm font-pmedium text-gray-600 ml-2">
                    Experience
                  </Text>
                </View>
                <Text className="text-sm">
                  {provider.verification?.professional?.experienceYears
                    ? `${provider.verification.professional.experienceYears}+ years`
                    : "Not specified"}
                </Text>
              </View>
            </View>

            <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <View className="flex-row items-center mb-3">
                <FontAwesome name="clock-o" size={16} color={colors.primary} />
                <Text className="text-sm font-pmedium text-gray-600 ml-2">
                  Availability
                </Text>
              </View>
              {provider.businessInfo?.workingDays?.length > 0 ? (
                <View>
                  {/* Working Days - Beautiful UI */}
                  <View className="flex-row flex-wrap mb-3">
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => (
                      <View
                        key={day}
                        className={`mr-2 mb-2 px-3 py-1 rounded-full ${
                          provider.businessInfo.workingDays.includes(day)
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-gray-100/50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-pmedium  ${
                            provider.businessInfo.workingDays.includes(day)
                              ? "text-primary"
                              : "text-gray-400"
                          }`}
                        >
                          {day.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Working Hours with AM/PM */}
                  {provider.businessInfo.workingHours?.startTime && (
                    <View className="flex-row items-center bg-gray-50 rounded-lg p-3">
                      <FontAwesome
                        name="clock-o"
                        size={14}
                        color={colors.primary}
                      />
                      <Text className="ml-2 text-sm font-pmedium">
                        {formatTimeToAMPM(
                          provider.businessInfo.workingHours.startTime
                        )}{" "}
                        -{" "}
                        {formatTimeToAMPM(
                          provider.businessInfo.workingHours.endTime
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="bg-gray-50 rounded-lg p-3">
                  <Text className="text-sm text-gray-500">Not specified</Text>
                </View>
              )}
            </View>
          </View>

          {/* About Section */}
          <View className="bg-white mt-4 px-5 py-4">
            <Text className="text-lg font-psemibold text-text mb-3">About</Text>
            <Text className="text-gray-600 leading-5">
              {provider.businessInfo?.description ||
                "No description provided by the service provider."}
            </Text>
          </View>

          {/* Services Section */}
          <View className="bg-white mt-4 px-5 py-4">
            <Text className="text-lg font-psemibold text-text mb-3">
              Services Offered
            </Text>

            {provider.selectedServices?.length > 0 ? (
              provider.selectedServices.map((categoryBlock, index) => (
                <View key={index} className="mb-4">
                  <Text className="text-base font-psemibold text-primary mb-2">
                    {categoryBlock.category?.name || "General Services"}
                  </Text>

                  {categoryBlock.services.map((srv, i) => (
                    <View
                      key={i}
                      className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100"
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="font-psemibold text-gray-800">
                            {srv.service?.name || "Unnamed Service"}
                          </Text>

                          {/* Add Rating Display Here */}
                          <View className="flex-row items-center mt-1">
                            {renderRatingStars(srv.rating?.average || 0)}
                            <Text className="text-xs text-gray-500 ml-1">
                              ({srv.rating?.count || 0})
                            </Text>
                          </View>

                          <Text className="text-sm font-pmedium text-primary mt-1">
                            {formatPricing(srv.pricing)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          className="bg-primary rounded-lg px-3 py-2 ml-2 flex-row items-center"
                          onPress={() => handleBookNow(srv)}
                        >
                          <Text className="text-white font-psemibold text-xs mr-2">
                            Book
                          </Text>
                          <FontAwesome
                            name="calendar"
                            size={12}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Optional: Add service description if available */}
                      {srv.service?.description && (
                        <Text className="text-xs text-gray-500 mt-2">
                          {srv.service.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View className="items-center py-6">
                <MaterialIcons name="handyman" size={32} color={colors.muted} />
                <Text className="text-gray-500 mt-2">
                  No services added yet
                </Text>
              </View>
            )}
          </View>

          {/* Service Area */}
          <View className="bg-white mt-4 px-5 py-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-psemibold text-text">
                Service Coverage
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-primary text-sm font-pmedium mr-1">
                  View Map
                </Text>
                <Ionicons name="map-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-start">
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View className="ml-3 flex-1">
                {provider.serviceArea?.type === "radius" ? (
                  <View className="mb-2">
                    <Text className="font-pmedium">
                      Serves within {provider.serviceArea.radiusInMeters / 1000}{" "}
                      km radius
                    </Text>
                    <View className="w-full bg-gray-100 rounded-full h-2 mt-2">
                      <View
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (provider.serviceArea.radiusInMeters / 50000) * 100
                          )}%`,
                        }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
                      Maximum service distance: 50 km
                    </Text>
                  </View>
                ) : provider.serviceArea?.type === "cities" &&
                  provider.serviceArea?.cities?.length ? (
                  <View>
                    <Text className="font-pmedium mb-1">
                      Serves in these cities:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {provider.serviceArea.cities.map((city, index) => (
                        <View
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                        >
                          <Text className="text-sm text-gray-800">{city}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : provider.serviceArea?.type === "states" &&
                  provider.serviceArea?.states?.length ? (
                  <View>
                    <Text className="font-pmedium mb-1">
                      Serves in these regions:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {provider.serviceArea.states.map((state, index) => (
                        <View
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                        >
                          <Text className="text-sm text-gray-800">{state}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text className="text-gray-500">
                    Service area not specified
                  </Text>
                )}

                {provider.businessInfo?.hasPhysicalShop &&
                  provider.businessInfo?.address && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <View className="flex-row items-start">
                        <Ionicons
                          name="business-outline"
                          size={18}
                          color={colors.primary}
                          className="mt-0.5"
                        />
                        <View className="ml-2">
                          <Text className="font-pmedium text-gray-800">
                            Physical Location
                          </Text>
                          <Text className="text-gray-600 mt-1">
                            {provider.businessInfo.address}
                          </Text>
                          <TouchableOpacity className="flex-row items-center mt-1">
                            <Text className="text-primary text-sm font-pmedium">
                              Get Directions
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={14}
                              color={colors.primary}
                              className="ml-1"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
              </View>
            </View>
          </View>

          {/* Verification Badges */}
          {(provider.verification?.identity?.status === "verified" ||
            provider.verification?.professional?.status === "verified") && (
            <View className="bg-white mt-4 px-5 py-4">
              <Text className="text-lg font-psemibold text-text mb-3">
                Verified Badges
              </Text>
              <View className="flex-row flex-wrap">
                {provider.verification?.identity?.status === "verified" && (
                  <View className="flex-row items-center bg-green-50 rounded-full px-3 py-1 mr-2 mb-2">
                    <FontAwesome
                      name="id-card"
                      size={14}
                      color={colors.success}
                    />
                    <Text className="text-sm text-success ml-1">
                      ID Verified
                    </Text>
                  </View>
                )}
                {provider.verification?.professional?.status === "verified" && (
                  <View className="flex-row items-center bg-blue-50 rounded-full px-3 py-1 mr-2 mb-2">
                    <FontAwesome
                      name="certificate"
                      size={14}
                      color={colors.primary}
                    />
                    <Text className="text-sm text-primary ml-1">
                      Professional
                    </Text>
                  </View>
                )}
                {provider.verification?.phone?.verified && (
                  <View className="flex-row items-center bg-purple-50 rounded-full px-3 py-1 mr-2 mb-2">
                    <FontAwesome
                      name="phone"
                      size={14}
                      color={colors.secondary}
                    />
                    <Text className="text-sm text-secondary ml-1">
                      Phone Verified
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View className="bg-white mt-4 px-5 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-psemibold text-text">
                Customer Reviews
              </Text>
              <TouchableOpacity
              // onPress={() => router.push(`/provider/${providerId}/reviews`)}
              >
                <Text className="text-primary font-pmedium">See All</Text>
              </TouchableOpacity>
            </View>

            {provider.reviews?.length > 0 ? (
              <View className="space-y-4">
                {provider.reviews.map((review) => (
                  <View
                    key={review._id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    {/* Review Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center flex-1">
                        <Image
                          source={{ uri: review.customer.profileImage }}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <View className="flex-1">
                          <Text className="font-psemibold text-gray-800">
                            {review.customer.fullName}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            {renderRatingStars(review.rating)}
                            <Text className="text-xs text-gray-500 ml-2">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Review Content */}
                    {review.comment && review.comment.trim() && (
                      <Text className="text-gray-600 leading-5">
                        "{review.comment}"
                      </Text>
                    )}

                    {/* Review Footer
                    <View className="flex-row justify-end mt-3">
                      <TouchableOpacity className="flex-row items-center">
                        <FontAwesome
                          name="thumbs-up"
                          size={14}
                          color={colors.primary}
                        />
                        <Text className="text-xs text-primary ml-1">
                          Helpful
                        </Text>
                      </TouchableOpacity>
                    </View> */}
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10 bg-white rounded-lg shadow-sm">
                <FontAwesome
                  name="comment-o"
                  size={40}
                  color={colors.muted}
                  style={{ opacity: 0.5 }}
                />
                <Text className="text-gray-500 mt-3 font-pmedium">
                  No reviews yet
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Be the first to review this provider
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
