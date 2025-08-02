import { View, Text, Image, ScrollView } from "react-native";
import { icons, images } from "../../../constants";
import TabHeader from "../../../components/ui/TabHeader";
import ProfileNotificationIcon from "../../../components/profile/ProfileNotificationIcon";
import ProfileContentHeading from "../../../components/profile/ProfileContentHeading";
import ProfileContentLink from "../../../components/profile/ProfileContentLink";
import ProfileLogoutBtn from "../../../components/profile/ProfileLogoutBtn";
import { useSelector } from "react-redux";
import { providerRoutes } from "../../../lib/routes";

export default function ProvidersProfile() {
  const { user } = useSelector((state) => state.auth);

  if (user.role !== "ServiceProvider") return null;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"My Profile"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative flex-1 bg-white">
          {/* Notifications */}
          <ProfileNotificationIcon to={providerRoutes.PROVIDER_NOTIFICATIONS} />

          {/* Avatar & Name */}
          <View className="items-center pt-8 pb-4">
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
            <Text className="mt-3 text-xl font-psemibold text-primary">
              {user.fullName}
            </Text>
          </View>

          {/* Status */}
          <View className="px-6 mb-2 flex-row items-center justify-center gap-2">
            <Text className="text-sm text-text text-center font-pregular">
              Profile Status:
            </Text>
            <Text className="text-secondary font-pmedium text-center">
              {user.accountStatus === "pending"
                ? "In Process"
                : user.accountStatus.charAt(0).toUpperCase() +
                  user.accountStatus.slice(1)}
            </Text>
          </View>

          {/* Guide */}
          {user.accountStatus !== "active" && (
            <View className="px-6 mb-6 flex-row items-center justify-center gap-2">
              <Text className="text-muted text-xs font-pregular text-center">
                {user.accountStatus === "pending"
                  ? "Complete your profile and submit\nthe required documents for verification."
                  : user.accountStatus === "verified"
                  ? "Your account has been verified.\nPlease wait while it is being activated."
                  : user.accountStatus === "suspended"
                  ? "Your account has been suspended.\nPlease contact support for assistance."
                  : ""}
              </Text>
            </View>
          )}

          {/* General Settings */}
          <ProfileContentHeading heading={"General"} />
          {[
            {
              label: "Personal Information",
              route: "/provider/profile/general/personal-information",
              // route: providerRoutes.PROVIDER_PERSONAL_INFO,
              icon: icons.profile,
            },
            {
              label: "Business Information",
              route: providerRoutes.PROVIDER_BUSINESS_INFO,
              icon: icons.briefcase,
            },
            {
              label: "My Services",
              route: providerRoutes.PROVIDER_SERVICES,
              icon: icons.services,
            },
            // {
            //   label: "Transation History",
            //   route: "/provider/profile/general/transaction-history",
            //   icon: icons.transactionHistory,
            // },
            {
              label: "Change Password",
              route: providerRoutes.PROVIDER_CHANGE_PASSWORD,
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
              route: providerRoutes.PROVIDER_VERIFICATION_PHONE,
              icon: icons.phoneNumber,
              status: user?.isPhoneVerified ? "Verified" : "Not Verified",
            },
            {
              label: "Identity Verification",
              route: providerRoutes.PROVIDER_VERIFICATION_IDENTITY,
              icon: icons.identity,
              status:
                user?.verification?.identity?.status === "pending"
                  ? "Not Verified"
                  : user.verification?.identity?.status
                      .charAt(0)
                      .toUpperCase() +
                    user.verification?.identity?.status.slice(1),
            },
            {
              label: "Professional Verification",
              route: providerRoutes.PROVIDER_VERIFICATION_PROFESSIONAL,
              icon: icons.professional,
              status:
                user?.verification?.professional?.status === "pending"
                  ? "Not Verified"
                  : user.verification?.professional?.status
                      .charAt(0)
                      .toUpperCase() +
                    user.verification?.professional?.status.slice(1),
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
          <ProfileLogoutBtn />
        </View>
      </ScrollView>
    </View>
  );
}
