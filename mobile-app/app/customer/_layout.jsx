import { Tabs } from "expo-router";
import { Image, Text, View, Dimensions } from "react-native";
import { icons } from "../../constants";
import { colors } from "../../constants/colors";
import { StatusBar } from "expo-status-bar";

const screenWidth = Dimensions.get("window").width;
const tabCount = 5;
const TAB_WIDTH = screenWidth / tabCount;

const tabScreens = [
  { name: "home", label: "Home", icon: icons.home },
  { name: "bookings", label: "Bookings", icon: icons.bookings },
  { name: "services", label: "Services", icon: icons.services },
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
          tintColor={color}
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
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: " black",
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.muted,
            height: 80,
            paddingTop: 10,
            paddingBottom: 10,
          },
        }}
      >
        {tabScreens.map((tab, index) => (
          <Tabs.Screen
            key={tab.name}
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

      <StatusBar backgroundColor={colors.primary} style="light" />
    </>
  );
};

export default CustomerTabsLayout;
