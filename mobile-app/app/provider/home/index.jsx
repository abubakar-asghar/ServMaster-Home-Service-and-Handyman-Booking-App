import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import TabHeader from "../../../components/ui/TabHeader";
import { colors } from "../../../constants/colors";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getProviderDashboardStats } from "../../../api/services/providerApi";
import { useEffect, useState } from "react";
import ProviderHomeSkeleton from "../../../components/skeletons/home/ProviderHomeSkeleton";
import { providerRoutes } from "../../../lib/routes";
// import { scheduleNotificationAsync } from "expo-notifications";

const StatsCard = ({ count, icon, label, onPress, color = colors.primary }) => (
  <TouchableOpacity
    className="py-5 px-3 w-[48%] rounded-xl bg-white shadow-sm border border-gray-100"
    onPress={onPress}
  >
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-gray-500 font-pmedium text-sm">{label}</Text>
        <Text className={`text-${color} text-xl font-psemibold mt-1 ml-2`}>
          {count}
        </Text>
      </View>
      <View
        className="p-3 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <Feather name={icon} size={20} color={color} />
      </View>
    </View>
  </TouchableOpacity>
);

const QuickActionCard = ({ icon, label, onPress }) => (
  <TouchableOpacity
    className="py-4 items-center rounded-xl bg-white shadow-sm border border-gray-100 w-[23%]"
    onPress={onPress}
  >
    <View className="p-3 rounded-lg bg-primary-50 mb-2">
      <Feather name={icon} size={20} color={colors.primary} />
    </View>
    <Text className="text-gray-700 font-pmedium text-xs text-center">
      {label}
    </Text>
  </TouchableOpacity>
);

const BookingStatusCard = ({ status, count, onPress }) => (
  <TouchableOpacity
    className="p-4 rounded-xl bg-white shadow-sm border border-gray-100 flex-1 mx-1"
    onPress={onPress}
  >
    <Text className="text-gray-500 font-pmedium text-sm">{status}</Text>
    <Text className="text-primary text-lg font-psemibold mt-1">{count}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ item }) => {
  const getColor = () => {
    switch (item.color) {
      case "success":
        return colors.success;
      case "info":
        return colors.info;
      case "warning":
        return colors.warning;
      default:
        return colors.primary;
    }
  };
  const getRecentActivityTime = () => {
    const date = new Date(item.date);
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

    return `${formattedDate}, ${formattedTime.toUpperCase()}`;
  };

  return (
    <View className="flex-row items-center">
      <View
        className="p-2 rounded-lg mr-3"
        style={{ backgroundColor: `${getColor()}20` }}
      >
        <Feather name={item.icon} size={18} color={getColor()} />
      </View>
      <View className="flex-1">
        <Text className="text-primary font-pmedium">{item.title}</Text>
        <Text className="text-gray-500 font-pregular text-xs">
          {getRecentActivityTime(item.date)}
        </Text>
      </View>
    </View>
  );
};

const ProviderDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: getProviderDashboardStats,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewBookings = (status) => {
    router.push({ pathname: `/provider/bookings`, params: { status } });
  };

  useEffect(() => {
    if (data) {
      console.log("Dashboard data fetched successfully:", data);
    }
  }, [data]);

  // Format earnings for display
  const formatEarnings = (amount) => {
    return `Rs ${amount?.toLocaleString() || "0"}`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TabHeader title={"Home"} />

      {isLoading ? (
        <ProviderHomeSkeleton />
      ) : error ? (
        <View className="flex-1 bg-gray-50 justify-center items-center">
          <Text className="text-red-500">Failed to load dashboard data</Text>
        </View>
      ) : (
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
          {/* Welcome Header */}
          <View className="mt-4 mb-6">
            <Text className="text-primary text-2xl font-psemibold">
              Hello, {user.fullName.split(" ")[0]}!
            </Text>
            <Text className="text-gray-500 font-pmedium mt-1">
              Here's what's happening today
            </Text>

            {/* <Pressable
              onPress={() => {
                console.log("Testing notification");
                scheduleNotificationAsync({
                  content: {
                    title: "⏰ Booking Reminder",
                    body: "You have a job scheduled in 1 hour!",
                  },
                  trigger: { seconds: 5 },
                });
              }}
            >
              <Text className="text-gray-500 font-pregular text-xs mt-1">
                Test Notification
              </Text>
            </Pressable> */}
          </View>

          {/* Stats Overview */}
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
            <StatsCard
              count={data?.stats?.bookings || 0}
              icon="calendar"
              label="Today's Bookings"
              onPress={() =>
                router.push({
                  pathname: providerRoutes.PROVIDER_BOOKINGS,
                  params: { status: "All" },
                })
              }
            />
            <StatsCard
              count={data?.stats?.services || 0}
              icon="tool"
              label="My Services"
              onPress={() => router.push(providerRoutes.PROVIDER_SERVICES)}
              color={colors.success}
            />
            <StatsCard
              count={formatEarnings(data?.stats?.earnings)}
              icon="dollar-sign"
              label="Today's Earnings"
              onPress={() => router.push("/provider/earnings")}
              color={colors.warning}
            />
            <StatsCard
              count={data?.stats?.rating || "0.0"}
              icon="star"
              label="My Rating"
              onPress={() => router.push(providerRoutes.PROVIDER_REVIEWS)}
              color={colors.info}
            />
          </View>

          {/* Quick Actions */}
          <Text className="text-primary font-psemibold text-lg mb-3">
            Quick Actions
          </Text>
          <View className="flex-row justify-between mb-6">
            <QuickActionCard
              icon="plus"
              label="Add Service"
              onPress={() => router.push(providerRoutes.PROVIDER_CATEGORIES)}
            />
            <QuickActionCard
              icon="clock"
              label="Availability"
              onPress={() => router.push(providerRoutes.PROVIDER_BUSINESS_INFO)}
            />
            <QuickActionCard
              icon="map-pin"
              label="Locations"
              onPress={() => router.push("/provider/locations")}
            />
            <QuickActionCard
              icon="settings"
              label="Settings"
              onPress={() => router.push("/provider/settings")}
            />
          </View>

          {/* Bookings Status */}
          <Text className="text-primary font-psemibold text-lg mb-3">
            Bookings Status
          </Text>
          <View className="flex-row mb-6">
            <BookingStatusCard
              status="Pending"
              count={data?.stats?.pendingRequests || 0}
              onPress={() => handleViewBookings("Pending")}
            />
            <BookingStatusCard
              status="Accepted"
              count={data?.stats?.acceptedRequests || 0}
              onPress={() => handleViewBookings("Accepted")}
            />
            <BookingStatusCard
              status="Completed"
              count={data?.stats?.completedRequests || 0}
              onPress={() => handleViewBookings("Completed")}
            />
          </View>

          {/* Recent Activity */}
          <Text className="text-primary font-psemibold text-lg mb-3">
            Recent Activity
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 gap-4">
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No recent activity
              </Text>
            )}
          </View>

          {/* Performance Metrics */}
          <Text className="text-primary font-psemibold text-lg mb-3">
            Performance
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 font-pmedium">
                Completion Rate
              </Text>
              <Text className="text-primary font-psemibold">
                {data?.performance?.completionRate || 0}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 font-pmedium">
                Avg. Response Time
              </Text>
              <Text className="text-primary font-psemibold">
                {data?.performance?.avgResponseTime || 0} mins
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 font-pmedium">
                Customer Satisfaction
              </Text>
              <Text className="text-primary font-psemibold">
                {data?.performance?.satisfaction || "0.0"}/5
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ProviderDashboardPage;

// import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
// import TabHeader from "../../../components/ui/TabHeader";
// import { icons, images } from "../../../constants";
// import { colors } from "../../../constants/colors";
// import { useSelector } from "react-redux";
// import { useRouter } from "expo-router";
// import { Feather, MaterialIcons } from "@expo/vector-icons";

// const StatsCard = ({ count, icon, label, onPress, color = colors.primary }) => (
//   <TouchableOpacity
//     className="py-5 px-3 w-[48%] rounded-xl bg-white shadow-sm border border-gray-100"
//     onPress={onPress}
//   >
//     <View className="flex-row items-center justify-between">
//       <View>
//         <Text className="text-gray-500 font-pmedium text-sm">{label}</Text>
//         <Text className={`text-${color} text-xl font-psemibold mt-1 ml-2`}>
//           {count}
//         </Text>
//       </View>
//       <View
//         className="p-3 rounded-lg"
//         style={{ backgroundColor: `${color}20` }}
//       >
//         <Feather name={icon} size={20} color={color} />
//       </View>
//     </View>
//   </TouchableOpacity>
// );

// const QuickActionCard = ({ icon, label, onPress }) => (
//   <TouchableOpacity
//     className="py-4 items-center rounded-xl bg-white shadow-sm border border-gray-100 w-[23%]"
//     onPress={onPress}
//   >
//     <View className="p-3 rounded-lg bg-primary-50 mb-2">
//       <Feather name={icon} size={20} color={colors.primary} />
//     </View>
//     <Text className="text-gray-700 font-pmedium text-xs text-center">
//       {label}
//     </Text>
//   </TouchableOpacity>
// );

// const BookingStatusCard = ({ status, count, onPress }) => (
//   <TouchableOpacity
//     className="p-4 rounded-xl bg-white shadow-sm border border-gray-100 flex-1 mx-1"
//     onPress={onPress}
//   >
//     <Text className="text-gray-500 font-pmedium text-sm">{status}</Text>
//     <Text className="text-primary text-lg font-psemibold mt-1">{count}</Text>
//   </TouchableOpacity>
// );

// const ProviderDashboardPage = () => {
//   const { user } = useSelector((state) => state.auth);
//   const router = useRouter();

//   // Dummy data - replace with actual data from your API
//   const stats = {
//     bookings: 8,
//     services: 5,
//     earnings: "Rs 24,500",
//     rating: "4.8",
//     pendingBookings: 3,
//     acceptedBookings: 4,
//     completedBookings: 1,
//   };

//   const handleViewBookings = (status) => {
//     router.push(`/provider/bookings?status=${status.toLowerCase()}`);
//   };

//   return (
//     <View className="flex-1 bg-gray-50">
//       <TabHeader title={"Dashboard"} />

//       <ScrollView showsVerticalScrollIndicator={false} className="px-5">
//         {/* Welcome Header */}
//         <View className="mt-4 mb-6">
//           <Text className="text-gray-800 text-2xl font-psemibold">
//             Hello, {user.fullName.split(" ")[0]}!
//           </Text>
//           <Text className="text-gray-500 font-pmedium mt-1">
//             Here's what's happening today
//           </Text>
//         </View>

//         {/* Stats Overview */}
//         <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
//           <StatsCard
//             count={stats.bookings}
//             icon="calendar"
//             label="Today's Bookings"
//             onPress={() => router.push("/provider/bookings")}
//           />
//           <StatsCard
//             count={stats.services}
//             icon="tool"
//             label="My Services"
//             onPress={() => router.push("/provider/services")}
//             color={colors.success}
//           />
//           <StatsCard
//             count={stats.earnings}
//             icon="dollar-sign"
//             label="Today's Earnings"
//             onPress={() => router.push("/provider/earnings")}
//             color={colors.warning}
//           />
//           <StatsCard
//             count={stats.rating}
//             icon="star"
//             label="My Rating"
//             onPress={() => router.push("/provider/reviews")}
//             color={colors.info}
//           />
//         </View>

//         {/* Quick Actions */}
//         <Text className="text-gray-800 font-psemibold text-lg mb-3">
//           Quick Actions
//         </Text>
//         <View className="flex-row justify-between mb-6">
//           <QuickActionCard
//             icon="plus"
//             label="Add Service"
//             onPress={() => router.push("/provider/services/add")}
//           />
//           <QuickActionCard
//             icon="clock"
//             label="Availability"
//             onPress={() => router.push("/provider/availability")}
//           />
//           <QuickActionCard
//             icon="map-pin"
//             label="Locations"
//             onPress={() => router.push("/provider/locations")}
//           />
//           <QuickActionCard
//             icon="settings"
//             label="Settings"
//             onPress={() => router.push("/provider/settings")}
//           />
//         </View>

//         {/* Bookings Status */}
//         <Text className="text-gray-800 font-psemibold text-lg mb-3">
//           Bookings Status
//         </Text>
//         <View className="flex-row mb-6">
//           <BookingStatusCard
//             status="Pending"
//             count={stats.pendingBookings}
//             onPress={() => handleViewBookings("Pending")}
//           />
//           <BookingStatusCard
//             status="Accepted"
//             count={stats.acceptedBookings}
//             onPress={() => handleViewBookings("Accepted")}
//           />
//           <BookingStatusCard
//             status="Completed"
//             count={stats.completedBookings}
//             onPress={() => handleViewBookings("Completed")}
//           />
//         </View>

//         {/* Recent Activity */}
//         <Text className="text-gray-800 font-psemibold text-lg mb-3">
//           Recent Activity
//         </Text>
//         <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
//           <View className="flex-row items-center mb-4">
//             <View className="p-2 rounded-lg bg-green-50 mr-3">
//               <Feather name="check-circle" size={18} color={colors.success} />
//             </View>
//             <View className="flex-1">
//               <Text className="text-gray-800 font-pmedium">
//                 Booking #SM2356 completed
//               </Text>
//               <Text className="text-gray-500 font-pregular text-xs">
//                 Today, 10:30 AM
//               </Text>
//             </View>
//           </View>
//           <View className="flex-row items-center mb-4">
//             <View className="p-2 rounded-lg bg-blue-50 mr-3">
//               <Feather name="calendar" size={18} color={colors.info} />
//             </View>
//             <View className="flex-1">
//               <Text className="text-gray-800 font-pmedium">
//                 New booking received
//               </Text>
//               <Text className="text-gray-500 font-pregular text-xs">
//                 Today, 9:15 AM
//               </Text>
//             </View>
//           </View>
//           <View className="flex-row items-center">
//             <View className="p-2 rounded-lg bg-amber-50 mr-3">
//               <Feather name="alert-circle" size={18} color={colors.warning} />
//             </View>
//             <View className="flex-1">
//               <Text className="text-gray-800 font-pmedium">
//                 Booking #SM2341 requires attention
//               </Text>
//               <Text className="text-gray-500 font-pregular text-xs">
//                 Yesterday, 4:45 PM
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Performance Metrics */}
//         <Text className="text-gray-800 font-psemibold text-lg mb-3">
//           Performance
//         </Text>
//         <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-gray-500 font-pmedium">Completion Rate</Text>
//             <Text className="text-primary font-psemibold">92%</Text>
//           </View>
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-gray-500 font-pmedium">
//               Avg. Response Time
//             </Text>
//             <Text className="text-primary font-psemibold">12 mins</Text>
//           </View>
//           <View className="flex-row justify-between items-center">
//             <Text className="text-gray-500 font-pmedium">
//               Customer Satisfaction
//             </Text>
//             <Text className="text-primary font-psemibold">4.8/5</Text>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default ProviderDashboardPage;

// import { View, Text, ScrollView, Image } from "react-native";
// import TabHeader from "../../../components/ui/TabHeader";
// import { icons, images } from "../../../constants";
// import { colors } from "../../../constants/colors";
// import { useSelector } from "react-redux";

// const InfoCard = ({ count, icon, label }) => (
//   <View className="p-5 w-[48%] rounded-2xl bg-primary">
//     <View className="flex-row items-center justify-between">
//       <Text className="text-white text-xl font-pmedium">{count}</Text>
//       <View className="p-2 rounded-full bg-white">
//         <Image source={icon} tintColor={colors.primary} className="w-5 h-5" />
//       </View>
//     </View>
//     <Text className="text-white font-pregular text-base mt-4">{label}</Text>
//   </View>
// );

// const ProviderTypeCard = () => (
//   <View className="p-5 mt-5 flex-row items-center justify-between rounded-2xl bg-muted-100">
//     <View>
//       <View className="flex-row items-center gap-2">
//         <Text className="font-pmedium text-muted text-base">Provider Type:</Text>
//         <Text className="font-psemibold text-text text-base">Company</Text>
//       </View>
//       <View className="flex-row items-center gap-2">
//         <Text className="font-pmedium text-muted text-base">My Commision:</Text>
//         <Text className="font-psemibold text-text text-base">80%</Text>
//       </View>
//     </View>
//     <View className="p-4 rounded-full bg-primary">
//       <Image
//         source={icons.services}
//         tintColor={colors.mutedLight}
//         className="h-5 w-5"
//       />
//     </View>
//   </View>
// );

// const ProviderDashboardPage = () => {
//   const { user } = useSelector((state) => state.auth)
//   return (
//     <View className="flex-1 bg-white">
//       <TabHeader title={"Home"} />
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View className="relative flex-1 bg-white p-5">
//           <Text className="text-primary text-2xl font-psemibold">
//             Hello, {user.fullName}
//           </Text>
//           <Text className="text-muted text-lg font-pmedium mt-2">
//             Welcome back!
//           </Text>

//           <ProviderTypeCard />

//           <View className="items-center justify-center gap-5 mt-5">
//             <View className="flex-row flex-wrap justify-between gap-y-5">
//               <InfoCard
//                 count="3"
//                 icon={icons.bookings}
//                 label="Total Bookings"
//               />
//               <InfoCard
//                 count="12"
//                 icon={icons.services}
//                 label="Total Services"
//               />
//               <InfoCard
//                 count="Rs 20,000"
//                 icon={icons.wallet}
//                 label="Total Earnings"
//               />
//               <InfoCard
//                 count="Rs 5,000"
//                 icon={icons.wallet}
//                 label="Wallet Balance"
//               />
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default ProviderDashboardPage;
