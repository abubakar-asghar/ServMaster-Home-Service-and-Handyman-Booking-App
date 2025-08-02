import { Tabs, usePathname } from "expo-router";
import { Image, Text, View, Dimensions } from "react-native";
import { icons } from "../../constants";
import { colors } from "../../constants/colors";
import { StatusBar } from "expo-status-bar";
import ProtectedRoute from "../../components/protection/ProtectedRoutes";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;
const tabCount = 5;
const TAB_WIDTH = screenWidth / tabCount;

const tabScreens = [
  { name: "home", label: "Home", icon: icons.home },
  { name: "bookings", label: "Bookings", icon: icons.bookings },
  { name: "categories", label: "Categories", icon: icons.services },
  { name: "chat", label: "Chat", icon: icons.chat },
  { name: "profile", label: "Profile", icon: icons.profile },
];

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      className="items-center justify-center gap-1 py-2"
      style={{ width: TAB_WIDTH }}
    >
      <View
        className={`rounded-full items-center justify-center py-2 px-5 ${
          focused && "bg-muted-100"
        }`}
      >
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={focused ? colors.primary : color}
          className="w-6 h-6 z-10"
        />
      </View>
      <Text
        className={`${
          focused ? "font-psemibold" : "font-pregular"
        } text-xs text-center z-10`}
        style={{ color }}
      >
        {name}
      </Text>
    </View>
  );
};

const CustomerTabsLayout = () => {
  const pathname = usePathname();

  const hide =
    pathname.includes("categories/") ||
    pathname.includes("profile/") ||
    pathname.includes("chat/") ||
    pathname.includes("bookings/");

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <LinearGradient
        colors={[
          colors.primary,
          colors.primary,
          colors.primary,
          colors.mutedLight,
          colors.mutedLight,
          colors.mutedLight,
        ]}
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <ProtectedRoute>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarActiveTintColor: " black",
              tabBarInactiveTintColor: colors.mutedForeground,
              tabBarStyle: {
                display: hide ? "none" : "flex",
                backgroundColor: colors.mutedLight,
                borderTopWidth: 1,
                borderTopColor: colors.muted,
                borderColor: "transparent",
                shadowColor: "white",
                height: 70,
                alignItems: "flex-start",
                paddingTop: 15,
                paddingBottom: 10,
              },
            }}
          >
            {tabScreens.map((tab, index) => (
              <Tabs.Screen
                key={tab.name + index}
                name={tab.name}
                options={{
                  title: tab.label,
                  headerShown: false,
                  tabBarIcon: ({ color, focused }) => (
                    <TabIcon
                      icon={tab.icon}
                      color={color}
                      name={tab.label}
                      focused={focused}
                    />
                  ),
                }}
              />
            ))}
          </Tabs>
        </ProtectedRoute>
      </SafeAreaView>

      <StatusBar style="light" />
    </View>
  );
};

export default CustomerTabsLayout;
