import { View, Text, Image, ScrollView } from "react-native";
import { icons, images } from "../../../constants";
import { colors } from "../../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../components/ui/TabHeader";
import ProfileNotificationIcon from "../../../components/profile/ProfileNotificationIcon";
import ProfileContentHeading from "../../../components/profile/ProfileContentHeading";
import ProfileContentLink from "../../../components/profile/ProfileContentLink";
import ProfileLogoutBtn from "../../../components/profile/ProfileLogoutBtn";
import { useRouter } from "expo-router";
import { clearStorage } from "../../../utils/storage";
import { logout } from "../../../store/slices/authSlice";
import { useDispatch } from "react-redux";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logout);
    await clearStorage();

    router.replace("/auth/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"My Profile"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative flex-1 bg-white">
          {/* Notifications */}
          <ProfileNotificationIcon to={"/provider/notifications"} />

          {/* Avatar & Name */}
          <View className="items-center pt-8 pb-4">
            <Image source={images.step3} className="w-24 h-24 rounded-full" />
            <Text className="mt-3 text-xl font-psemibold text-text">
              John Doe
            </Text>
          </View>

          {/* Status */}
          <View className="px-6 mb-6 flex-row items-center justify-center gap-2">
            <Text className="text-sm text-muted text-center font-pregular">
              Profile Status:
            </Text>
            <Text className="text-secondary font-pmedium text-center">
              In Process
            </Text>
          </View>

          {/* General Settings */}
          <ProfileContentHeading heading={"General"} />
          {[
            {
              label: "Personal Information",
              route: "/provider/profile/general/personal-information",
              icon: icons.profile,
            },
            {
              label: "Business Information",
              route: "/provider/profile/general/business-information",
              icon: icons.briefcase,
            },
            {
              label: "My Services",
              route: "/provider/profile/services",
              icon: icons.services,
            },
            {
              label: "Transation History",
              route: "/provider/profile/general/transaction-history",
              icon: icons.transactionHistory,
            },
            {
              label: "Change Password",
              route: "/provider/profile/general/change-password",
              icon: icons.password,
            },
          ].map((item) => (
            <ProfileContentLink key={item.label} item={item} />
          ))}

          {/* Account Verification */}
          <ProfileContentHeading heading={"Account Verification"} />
          {[
            {
              label: "Phone Number",
              route: "/provider/profile/verification/phone-verification",
              icon: icons.phoneNumber,
              status: "Not Verified",
            },
            {
              label: "Identity Verification",
              route: "/provider/profile/verification/identity-verification",
              icon: icons.identity,
              status: "Not Verified",
            },
            {
              label: "Professional Verification",
              route: "/provider/profile/verification/professional-verification",
              icon: icons.professional,
              status: "Not Verified",
            },
          ].map((item) => (
            <ProfileContentLink key={item.label} item={item} />
          ))}

          {/* About App */}
          <ProfileContentHeading heading={"About App"} />
          {[
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
          <ProfileLogoutBtn onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
