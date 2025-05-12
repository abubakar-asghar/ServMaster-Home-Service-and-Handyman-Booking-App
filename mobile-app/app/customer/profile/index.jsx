import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../../../constants";
import { colors } from "../../../constants/colors";
import TabHeader from "../../../components/ui/TabHeader";
import ProfileNotificationIcon from "../../../components/profile/ProfileNotificationIcon";
import ProfileContentHeading from "../../../components/profile/ProfileContentHeading";
import ProfileContentLink from "../../../components/profile/ProfileContentLink";
import ProfileLogoutBtn from "../../../components/profile/ProfileLogoutBtn";

export default function CustomerProfileTab() {
  return (
    <SafeAreaView className="flex-1 bg-white">
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
            <Image source={images.step3} className="w-24 h-24 rounded-full" />
            <Text className="mt-3 text-xl font-psemibold text-text">
              John Doe
            </Text>
            <Text className="text-text text-sm font-pregular">
              abubakarmalik2949@gmail.com
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
              route: "route2",
            },
            {
              icon: icons.favorite,
              label: "Favorite Providers",
              route: "route3",
            },
            // { icon: icons.terms, label: "Blogs", route: "route4" },
            // { icon: icons.star, label: "Rate Us", route: "route5" },
            { icon: icons.star, label: "My Reviews", route: "route6" },
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
    </SafeAreaView>
  );
}
