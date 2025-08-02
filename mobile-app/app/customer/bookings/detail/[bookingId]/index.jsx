import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import TabHeader from "../../../../../components/ui/TabHeader";
import { icons } from "../../../../../constants";
import { colors } from "../../../../../constants/colors";
import CustomButton from "../../../../../components/ui/CustomButton";
import { router, useGlobalSearchParams } from "expo-router";
import {
  useCancelBookingFromCustomer,
  useGetBookingDetails,
} from "../../../../../hooks/useBookings";
import CustomerBookingDetailsSkeleton from "../../../../../components/skeletons/bookings/CustomerBookingDetailsSkeleton";
import ProfileImage from "../../../../../components/profile/ProfileImage";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { customerRoutes } from "../../../../../lib/routes";
import {
  useCreateReview,
  useDeleteReview,
  useUpdateReview,
} from "../../../../../hooks/useReview";

const cancellationReasons = [
  { id: "schedule_conflict", label: "Schedule conflict" },
  { id: "found_another_provider", label: "Found another provider" },
  { id: "no_longer_needed", label: "No longer needed" },
  { id: "price_issue", label: "Price issue" },
  { id: "other", label: "Other reason" },
];

const Heading = ({ title }) => {
  return (
    <Text className="text-primary font-psemibold text-lg mt-6">{title}</Text>
  );
};

const CancellationDetails = ({ cancellation }) => {
  if (!cancellation) return null;

  const getCancelledByText = () => {
    switch (cancellation.cancelled_by) {
      case "Customer":
        return "Cancelled by You";
      case "ServiceProvider":
        return "Cancelled by Provider";
      case "System":
        return "Cancelled by System";
      default:
        return "Cancelled";
    }
  };

  const getFormattedDate = (date) => {
    if (!date) return "N/A";

    const d = new Date(date);

    const formattedDate = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    let ampm = "AM";

    if (hours >= 12) {
      ampm = "PM";
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return `${formattedDate}, ${formattedTime}`;
  };

  return (
    <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
      <View className="flex-row items-center mb-3">
        <Feather name="alert-triangle" size={20} color={colors.danger} />
        <Text className="text-red-600 font-psemibold ml-2">
          {getCancelledByText()}
        </Text>
        <Text className="text-gray-500 font-pmedium ml-auto">
          {getFormattedDate(cancellation.cancelled_at)}
        </Text>
      </View>

      <View className="bg-red-50 p-3 rounded-lg">
        <Text className="text-gray-800 font-pmedium mb-1">Reason:</Text>
        <Text className="text-gray-700 font-pregular">
          {cancellation.reason || "No reason provided"}
        </Text>
      </View>
    </View>
  );
};

const BookingDetail = () => {
  const { bookingId } = useGlobalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReasonType, setSelectedReasonType] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const { mutateAsync: createReview, isPending: isSubmittingReview } =
    useCreateReview();
  const { mutateAsync: updateReview, isPending: isUpdatingReview } =
    useUpdateReview();
  const { mutateAsync: deleteReview, isPending: isDeletingReview } =
    useDeleteReview();

  const {
    data,
    isPending: isFetchingBookingDetail,
    error,
    refetch: refetchBookingDetail,
  } = useGetBookingDetails(bookingId);

  const { mutateAsync: cancelBooking, isPending: isCanceling } =
    useCancelBookingFromCustomer();

  const booking = data?.data;

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Please select a rating");
      return;
    }

    const reviewData = {
      service_request: booking._id,
      service: booking.service._id,
      service_provider: booking.service_provider._id,
      rating,
      comment: reviewComment,
    };

    // Use your API endpoint for editing if in edit mode
    if (isEditingReview) {
      reviewData.reviewId = booking.review._id;
      await updateReview(reviewData);
    } else {
      await createReview(reviewData);
    }

    setShowReviewModal(false);
    setIsEditingReview(false);
    setRating(0);
    setReviewComment("");
  };

  const handleDeleteReview = async () => {
    const reviewId = booking.review._id;
    await deleteReview(reviewId);
    setShowDeleteModal(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchBookingDetail();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const date = new Date(booking?.scheduled_time);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleCancelPress = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    try {
      const finalReason =
        selectedReasonType === "other"
          ? otherReason
          : cancellationReasons.find((r) => r.id === selectedReasonType)?.label;

      await cancelBooking({
        bookingId,
        reason: finalReason,
        reasonType: selectedReasonType,
      });
      setShowCancelModal(false);
      setSelectedReasonType("");
      setOtherReason("");
      // refetchBookingDetail();
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const getStatusColor = () => {
    switch (booking?.status) {
      case "pending":
        return { bg: "bg-amber-100", text: "text-amber-800" };
      case "accepted":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "declined":
        return { bg: "bg-red-100", text: "text-red-800" };
      default:
        return { bg: "bg-primary-100", text: "text-primary-800" };
    }
  };

  const statusColors = getStatusColor();

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title="Booking Details" goBack="/customer/bookings" />

      {isFetchingBookingDetail ? (
        <CustomerBookingDetailsSkeleton />
      ) : error || !data?.data ? (
        <View className="flex-1 justify-center items-center bg-white">
          <Feather name="alert-circle" size={48} color={colors.danger} />
          <Text className="mt-4 text-red-600 text-lg font-psemibold text-center">
            Failed to load booking details
          </Text>
          <Text className="mt-2 text-muted font-pmedium text-center">
            Please try again later
          </Text>
          <CustomButton
            title="Retry"
            containerStyles="w-[100px] bg-primary mt-4"
            textStyles="text-white"
            handlePress={refetchBookingDetail}
            isLoading={isFetchingBookingDetail}
          />
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-5"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor="#fff"
              />
            }
          >
            {/* Booking Header */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <Text className="text-gray-500 font-pmedium mr-2">
                  Booking ID
                </Text>
                <Text className="text-primary font-psemibold">
                  #{booking._id.slice(-6).toUpperCase()}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.text}`}
              >
                <Text className="text-xs font-psemibold uppercase">
                  {booking.status}
                </Text>
              </View>
            </View>

            {/* Cancellation Details */}
            {booking?.status === "cancelled" && (
              <>
                <Heading title={"Cancellation Details"} />
                <CancellationDetails cancellation={booking?.cancellation} />
              </>
            )}

            {/* Service Information */}
            <Heading title={"Service Information"} />
            <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
              <View className="flex-row items-center">
                <View className="p-3 bg-primary-50 rounded-lg mr-4">
                  <Image
                    source={{ uri: booking.service?.icon }}
                    className="w-12 h-12"
                    tintColor={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-primary font-psemibold text-lg">
                    {booking.service?.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Feather name="clock" size={14} color={colors.gray} />
                    <Text className="text-gray-600 font-pmedium text-sm ml-2">
                      {formattedDate} at {formattedTime.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {booking?.review && (
              <>
                <Heading title={"Your Review"} />
                <View className="bg-white rounded-xl p-5 mt-3 shadow-sm border border-gray-100">
                  {/* Review Header with Rating and Date */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <View key={star} className="mr-1">
                          <FontAwesome
                            name={
                              star <= booking.review.rating ? "star" : "star-o"
                            }
                            size={22}
                            color={
                              star <= booking.review.rating
                                ? colors.warning
                                : colors.muted
                            }
                          />
                        </View>
                      ))}
                      <Text className="text-warning font-psemibold ml-2">
                        {booking.review.rating.toFixed(1)}
                      </Text>
                    </View>

                    <Text className="text-muted gray-400 font-pmedium text-sm">
                      {new Date(booking.review.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </Text>
                  </View>

                  {/* Review Content */}
                  {booking.review.comment && (
                    <View className="bg-gray-50 rounded-lg p-4 mb-4">
                      <Text className="text-gray-700 font-pregular leading-5">
                        {booking.review.comment}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row justify-end gap-2">
                    {/* Delete Button */}
                    <TouchableOpacity
                      className="flex-row items-center px-3 py-2 rounded-lg bg-red-50"
                      onPress={() => setShowDeleteModal(true)}
                    >
                      <Feather name="trash-2" size={16} color={colors.danger} />
                      <Text className="text-danger font-pmedium ml-2">
                        Delete
                      </Text>
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                      className="flex-row items-center bg-muted-light px-3 py-2 rounded-lg bg-primary-50"
                      onPress={() => {
                        setRating(booking.review.rating);
                        setReviewComment(booking.review.comment || "");
                        setIsEditingReview(true);
                        setShowReviewModal(true);
                      }}
                    >
                      <Feather name="edit-2" size={16} color={colors.primary} />
                      <Text className="text-primary font-pmedium ml-2">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Customer Notes */}
            <Heading title={"Your Notes"} />
            <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
              <Text className="text-gray-600 font-pmedium text-sm">
                {booking.customer_notes || "No notes provided"}
              </Text>
            </View>

            {/* Service Provider */}
            <Heading title={"Service Provider"} />
            <View className="bg-white rounded-xl p-4 mt-2 shadow-sm">
              <Pressable
                className="flex-row items-center"
                onPress={() =>
                  router.push(
                    customerRoutes.CUSTOMER_PROVIDER_PROFILE(
                      booking.service_provider._id
                    )
                  )
                }
              >
                <ProfileImage
                  image={booking.service_provider?.profileImage}
                  className="w-14 h-14 rounded-full mr-4"
                />
                <View>
                  <Text className="text-gray-800 font-psemibold">
                    {booking.service_provider?.fullName || "Not assigned"}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Feather name="phone" size={14} color={colors.gray} />
                    <Text className="text-gray-600 font-pmedium text-sm ml-2">
                      {booking.service_provider?.phone || "N/A"}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {booking.status === "accepted" && (
                <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-200 gap-3">
                  <CustomButton
                    icon={icons.call}
                    containerStyles="bg-primary flex-1 p-3"
                    textStyles="text-white"
                    handlePress={() =>
                      Linking.openURL(`tel:${booking.service_provider?.phone}`)
                    }
                  />
                  <CustomButton
                    icon={icons.chat}
                    containerStyles="bg-white border border-gray-300 flex-1 p-3"
                    textStyles="text-primary"
                    handlePress={() => {}}
                  />
                  {booking.service_provider?.personalInfo?.whatsapp && (
                    <CustomButton
                      icon={icons.whatsapp}
                      containerStyles="bg-white border border-gray-300 flex-1 p-3"
                      tintColor={false}
                      handlePress={() =>
                        Linking.openURL(
                          `https://wa.me/${booking.service_provider?.personalInfo?.whatsapp}`
                        )
                      }
                    />
                  )}
                </View>
              )}
            </View>

            {/* Pricing Details */}
            <Heading title={"Pricing Details"} />
            <View className="bg-white rounded-xl p-4 mt-2 mb-6 shadow-sm">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-500 font-pmedium">Service Type</Text>
                <Text className="text-gray-800 font-psemibold capitalize">
                  {booking?.pricing?.type?.replace("_", " ")}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-t border-gray-200">
                <Text className="text-gray-500 font-pmedium">Service Fee</Text>
                <Text className="text-primary font-psemibold">
                  {booking?.pricing.type === "negotiable"
                    ? "Negotiable"
                    : `Rs ${booking?.pricing.amount}`}
                </Text>
              </View>

              {booking?.pricing.notes && (
                <View className="mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-gray-500 font-pmedium">Notes</Text>
                  <Text className="text-gray-700 font-pregular mt-1">
                    {booking.pricing.notes}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Cancel Booking Modal */}
          <Modal
            visible={showCancelModal}
            transparent={true}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={() => {
              setShowCancelModal(false);
              setSelectedReasonType("");
              setOtherReason("");
            }}
          >
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
                <Text className="text-xl font-psemibold text-center mb-4">
                  Cancel Booking
                </Text>
                <Text className="text-gray-600 font-pmedium mb-6 text-center">
                  Please let us know why you're canceling this booking
                </Text>

                <View className="mb-4">
                  <Text className="text-gray-800 font-pmedium mb-2">
                    Reason for cancellation
                  </Text>
                  {cancellationReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason.id}
                      className={`flex-row items-center py-3 px-4 mb-2 rounded-lg border ${
                        selectedReasonType === reason.id
                          ? "border-primary bg-primary-50"
                          : "border-gray-200"
                      }`}
                      onPress={() => {
                        setSelectedReasonType(reason.id);
                        if (reason.id !== "other") {
                          setOtherReason("");
                        }
                      }}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border mr-3 ${
                          selectedReasonType === reason.id
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      />
                      <Text className="font-pmedium">{reason.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedReasonType === "other" && (
                  <View className="mb-4">
                    <Text className="text-gray-800 font-pmedium mb-2">
                      Please specify
                    </Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-3 font-pmedium"
                      placeholder="Enter your reason"
                      multiline
                      numberOfLines={3}
                      value={otherReason}
                      onChangeText={setOtherReason}
                    />
                  </View>
                )}

                <View className="flex-row justify-between mt-4">
                  <CustomButton
                    title="Go Back"
                    containerStyles="flex-1 bg-white border-2 border-gray-300 mr-2"
                    textStyles="text-gray-700"
                    handlePress={() => {
                      setShowCancelModal(false);
                      setSelectedReasonType("");
                      setOtherReason("");
                    }}
                  />
                  <CustomButton
                    title="Confirm Cancel"
                    containerStyles={`flex-1 bg-red-500`}
                    textStyles="text-white"
                    handlePress={handleCancelConfirm}
                    disabled={
                      !selectedReasonType ||
                      (selectedReasonType === "other" && !otherReason)
                    }
                    isLoading={isCanceling}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Action Buttons */}
          {booking?.status === "pending" && (
            <View className="px-5 py-3 bg-white border-t border-gray-200">
              <CustomButton
                title="Cancel Booking"
                containerStyles="bg-white border border-red-500 w-full py-3"
                textStyles="text-red-600 font-psemibold"
                handlePress={handleCancelPress}
                disabled={isCanceling}
              />
            </View>
          )}

          {/* Review Button */}
          {booking?.status === "completed" && !booking.hasReview && (
            <View className="px-5 py-3 bg-white border-t border-gray-200">
              <CustomButton
                title="Leave a Review"
                containerStyles="bg-primary w-full py-3"
                textStyles="text-white font-psemibold"
                handlePress={() => setShowReviewModal(true)}
              />
            </View>
          )}

          {/* Review Modal */}
          <Modal
            visible={showReviewModal}
            transparent={true}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={() => {
              setShowReviewModal(false);
              setIsEditingReview(false);
              setRating(0);
              setReviewComment("");
            }}
          >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
              <View className="bg-white rounded-xl w-full max-w-md p-6">
                <Text className="text-xl font-psemibold text-center mb-4">
                  {isEditingReview
                    ? "Edit Your Review"
                    : "Rate Your Experience"}
                </Text>

                {/* Star Rating */}
                <View className="flex-row justify-center my-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome
                        name={star <= rating ? "star" : "star-o"}
                        size={36}
                        color={star <= rating ? colors.warning : colors.muted}
                        className="mx-1"
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Review Comment */}
                <TextInput
                  className="border border-gray-200 rounded-lg p-4 font-pregular h-32 text-gray-800"
                  placeholder="Share your detailed experience..."
                  placeholderTextColor={colors.gray400}
                  multiline
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />

                {/* Action Buttons */}
                <View className="flex-row justify-between mt-6 gap-3">
                  <CustomButton
                    title="Cancel"
                    containerStyles="bg-white border border-gray-300 flex-1"
                    textStyles="text-gray-700"
                    handlePress={() => {
                      setShowReviewModal(false);
                      setIsEditingReview(false);
                      setRating(0);
                      setReviewComment("");
                    }}
                  />
                  <CustomButton
                    title={isEditingReview ? "Update" : "Submit"}
                    containerStyles="bg-primary flex-1"
                    textStyles="text-white font-psemibold"
                    handlePress={handleReviewSubmit}
                    isLoading={isSubmittingReview || isUpdatingReview}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Delete Review Confirmation Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showDeleteModal}
            statusBarTranslucent={true}
            onRequestClose={() => setShowDeleteModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/70">
              <View className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
                {/* Modal Header */}
                <View className="items-center mb-5">
                  <View className="bg-red-100 p-3 rounded-full mb-3">
                    <Feather name="trash-2" size={28} color={colors.danger} />
                  </View>
                  <Text className="text-xl font-psemibold text-center text-gray-900">
                    Delete Your Review?
                  </Text>
                </View>

                {/* Modal Body */}
                <Text className="text-gray-600 text-center mb-6 px-2 font-pregular">
                  This action cannot be undone. Your review will be permanently
                  removed.
                </Text>

                {/* Action Buttons */}
                <View className="flex-row justify-between gap-3">
                  <CustomButton
                    title="Cancel"
                    handlePress={() => setShowDeleteModal(false)}
                    containerStyles="flex-1 bg-white border border-gray-300"
                    textStyles="text-gray-700 font-pmedium"
                    disabled={isDeletingReview}
                  />
                  <CustomButton
                    title="Delete Review"
                    handlePress={handleDeleteReview}
                    containerStyles="flex-1 bg-red-600"
                    textStyles="text-white font-psemibold"
                    isLoading={isDeletingReview}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default BookingDetail;
