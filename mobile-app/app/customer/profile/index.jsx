import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { icons, images } from "../../../constants";
import { colors } from "../../../constants/colors";
import TabHeader from "../../../components/ui/TabHeader";
import ProfileNotificationIcon from "../../../components/profile/ProfileNotificationIcon";
import ProfileContentHeading from "../../../components/profile/ProfileContentHeading";
import ProfileContentLink from "../../../components/profile/ProfileContentLink";
import ProfileLogoutBtn from "../../../components/profile/ProfileLogoutBtn";
import { useSelector } from "react-redux";
import { customerRoutes } from "../../../lib/routes";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function CustomerProfileTab() {
  const { user } = useSelector((state) => state.auth);

  if (user.role !== "Customer") return null;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="My Profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="relative flex-1 bg-white">
          {/* Notifications */}
          <ProfileNotificationIcon to={"/customer/notifications"} />

          {/* Avatar and Name */}
          <View className="items-center pt-8 pb-4 mb-5">
            <View className="relative">
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
                  <FontAwesome name="user" size={36} color={colors.primary} />
                </View>
              )}
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-primary rounded-full p-2"
                onPress={() => router.push("/customer/profile/personal")}
              >
                <FontAwesome name="pencil" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="mt-3 text-xl font-psemibold text-text">
              {user.fullName}
            </Text>
            <Text className="text-text text-sm font-pregular">
              Phone No. {user.phone}
            </Text>
          </View>

          {/* General Section */}
          <ProfileContentHeading heading={"General"} />
          {[
            // {
            //   icon: icons.wallet,
            //   label: "Wallet Balance",
            //   right: "$0.00",
            //   color: "text-green-600",
            //   route: "route1",
            // },
            {
              icon: icons.favorite,
              label: "Favorite Services",
              route: customerRoutes.CUSTOMER_FAVORITE_SERVICES,
            },
            {
              icon: icons.favorite,
              label: "Favorite Providers",
              route: customerRoutes.CUSTOMER_FAVORITE_PROVIDERS,
            },
            {
              icon: icons.star,
              label: "My Reviews",
              route: customerRoutes.CUSTOMER_REVIEWS,
            },
          ].map((item) => (
            <ProfileContentLink key={item.label} item={item} />
          ))}

          {/* About App */}
          <ProfileContentHeading heading={"About App"} />
          {[
            {
              label: "About App",
              route: "about-app",
              icon: icons.info,
            },
            {
              label: "Customer Support",
              route: "customer-support",
              icon: icons.support,
            },
            {
              label: "Terms & Conditions",
              route: "terms-conditions",
              icon: icons.terms,
            },
          ].map((item) => (
            <ProfileContentLink key={item.label} item={item} />
          ))}

          {/* Logout Button */}
          <ProfileLogoutBtn />
        </View>
      </ScrollView>
    </View>
  );
}
