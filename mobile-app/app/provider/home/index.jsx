import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../components/ui/TabHeader";
import { icons, images } from "../../../constants";
import { colors } from "../../../constants/colors";
import { useSelector } from "react-redux";

const InfoCard = ({ count, icon, label }) => (
  <View className="p-5 w-[48%] rounded-2xl bg-primary">
    <View className="flex-row items-center justify-between">
      <Text className="text-white text-xl font-pmedium">{count}</Text>
      <View className="p-2 rounded-full bg-white">
        <Image source={icon} tintColor={colors.primary} className="w-5 h-5" />
      </View>
    </View>
    <Text className="text-white font-pregular text-base mt-4">{label}</Text>
  </View>
);

const ProviderTypeCard = () => (
  <View className="p-5 mt-5 flex-row items-center justify-between rounded-2xl bg-muted-100">
    <View>
      <View className="flex-row items-center gap-2">
        <Text className="font-pmedium text-muted text-base">Provider Type:</Text>
        <Text className="font-psemibold text-text text-base">Company</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="font-pmedium text-muted text-base">My Commision:</Text>
        <Text className="font-psemibold text-text text-base">80%</Text>
      </View>
    </View>
    <View className="p-4 rounded-full bg-primary">
      <Image
        source={icons.services}
        tintColor={colors.mutedLight}
        className="h-5 w-5"
      />
    </View>
  </View>
);

const ProviderDashboardPage = () => {
  const { user } = useSelector((state) => state.auth)
  return (
    <SafeAreaView className="flex-1 bg-white">
      <TabHeader title={"Home"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative flex-1 bg-white p-5">
          <Text className="text-primary text-2xl font-psemibold">
            Hello, {user.fullName}
          </Text>
          <Text className="text-muted text-lg font-pmedium mt-2">
            Welcome back!
          </Text>

          <ProviderTypeCard />

          <View className="items-center justify-center gap-5 mt-5">
            <View className="flex-row flex-wrap justify-between gap-y-5">
              <InfoCard
                count="3"
                icon={icons.bookings}
                label="Total Bookings"
              />
              <InfoCard
                count="12"
                icon={icons.services}
                label="Total Services"
              />
              <InfoCard
                count="Rs 20,000"
                icon={icons.wallet}
                label="Total Earnings"
              />
              <InfoCard
                count="Rs 5,000"
                icon={icons.wallet}
                label="Wallet Balance"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderDashboardPage;
