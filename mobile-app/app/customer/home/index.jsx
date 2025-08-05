import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
} from "react-native";
import { Link, router } from "expo-router";
import { icons, images } from "../../../constants";
import { colors } from "../../../constants/colors";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedLocation } from "../../../store/slices/locationSlice";
import * as Location from "expo-location";
import { useState } from "react";
import { customerRoutes } from "../../../lib/routes";
import { Ionicons } from "@expo/vector-icons";

const serviceCategories = [
  {
    _id: "680080c0ea363127fda51fda",
    name: "Air Conditioner Services",
    description:
      "Complete installation, service, and repair solutions for air conditioners.",
    createdAt: "2025-04-17T04:17:04.075Z",
    slug: "air-conditioner-services",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/ac-repair_hhcqak.png",
    __v: 0,
  },
  {
    _id: "68008105ea363127fda51fdd",
    name: "Appliance Services",
    description:
      "Installation and repair services for home appliances including kitchen and laundry units.",
    createdAt: "2025-04-17T04:18:13.822Z",
    slug: "appliance-installation--repair",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751763930/appliances-repair_x85vit.png",
    __v: 0,
  },
  {
    _id: "68008110ea363127fda51fe0",
    name: "Car General Services",
    description: "Interior and exterior detailing for all car types.",
    createdAt: "2025-04-17T04:18:24.672Z",
    slug: "car-general-services",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/car-service_g04nbi.png",
    __v: 0,
  },
  {
    _id: "68008122ea363127fda51fe3",
    name: "Carpentry & Woodwork",
    description: "Customized woodwork, installation, and repair solutions.",
    createdAt: "2025-04-17T04:18:42.913Z",
    slug: "carpentry--woodwork",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764670/woodwork_z0twy9.png",
    __v: 0,
  },
  {
    _id: "6800812bea363127fda51fe6",
    name: "Electrician Services",
    description:
      "Electrical installations, repair and troubleshooting for home and office.",
    createdAt: "2025-04-17T04:18:51.913Z",
    slug: "electrician-services",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/electrician_ppheeg.png",
    __v: 0,
  },
  {
    _id: "68008134ea363127fda51fe9",
    name: "Geyser Services",
    description:
      "Complete installation and maintenance of gas and electric geysers.",
    createdAt: "2025-04-17T04:19:00.425Z",
    slug: "geyser-installation-service--repair",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/geyser-service_hahwav.png",
    __v: 0,
  },
  {
    _id: "6800813dea363127fda51fec",
    name: "Grey Structure Services",
    description: "Construction of commercial and residential grey structures.",
    createdAt: "2025-04-17T04:19:09.113Z",
    slug: "grey-structure-services",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751765259/grey-structure_yhyxjm.png",
    __v: 0,
  },
  {
    _id: "68008146ea363127fda51fef",
    name: "Home Finishing Services",
    description:
      "End-to-end finishing including electrical, plumbing, flooring and painting.",
    createdAt: "2025-04-17T04:19:18.538Z",
    slug: "home-finishing-services",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/home-finishing_cjvstg.png",
    __v: 0,
  },
  {
    _id: "6800814fea363127fda51ff2",
    name: "Painting, Wallpaper & Furniture Polish",
    description:
      "Interior and exterior painting, polish, and wallpaper installation services.",
    createdAt: "2025-04-17T04:19:27.251Z",
    slug: "painting-wallpaper--furniture-polish",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/painting_nrjg1u.png",
    __v: 0,
  },
  {
    _id: "68008157ea363127fda51ff5",
    name: "Home Repair & Maintenance",
    description: "General home maintenance, renovation, and repair solutions.",
    createdAt: "2025-04-17T04:19:35.271Z",
    slug: "home-repair--maintenance",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751765259/home-repair_hzntjn.png",
    __v: 0,
  },
  {
    _id: "6800815fea363127fda51ff8",
    name: "Leakage, Seepage & Heat Proofing",
    description:
      "Protection against water leakage, seepage, and excessive heat.",
    createdAt: "2025-04-17T04:19:43.938Z",
    slug: "leakage-seepage--heat-proofing",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/leakage-repair_pfnu9s.png",
    __v: 0,
  },
  {
    _id: "68008168ea363127fda51ffb",
    name: "Pest Control",
    description:
      "Eradication and protection from pests like termites, insects, and rodents.",
    createdAt: "2025-04-17T04:19:52.444Z",
    slug: "pest-control",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764669/insecticide_i0vpho.png",
    __v: 0,
  },
  {
    _id: "68008171ea363127fda51ffe",
    name: "Plumbing Services",
    description:
      "Installation and repair of all plumbing fixtures and piping systems.",
    createdAt: "2025-04-17T04:20:01.039Z",
    slug: "plumbing-services",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751763878/plumbing_fwsswo.png",
    __v: 0,
  },
  {
    _id: "68008179ea363127fda52001",
    name: "Professional Cleaning",
    description:
      "Specialized cleaning services for home, carpets, sofas, and water tanks.",
    createdAt: "2025-04-17T04:20:09.429Z",
    slug: "professional-cleaning",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751763878/cleaning_beohww.png",
    __v: 0,
  },
  {
    _id: "68008182ea363127fda52004",
    name: "Solar Panel Installation & Maintenance",
    description:
      "Solar energy system installation, repair, and regular maintenance services.",
    createdAt: "2025-04-17T04:20:18.027Z",
    slug: "solar-panel-installation--maintenance",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751737079/solar-system_uacq57.png",
    __v: 0,
  },
  {
    _id: "68008189ea363127fda52007",
    name: "Welding, Glass, Aluminium & Metal Work",
    description:
      "Customized work related to welding, glass fitting, aluminum, and metal structures.",
    createdAt: "2025-04-17T04:20:25.147Z",
    slug: "welding-glass-aluminium--metal-work",
    icon: "https://res.cloudinary.com/abubakarmalik/image/upload/v1751764670/welding_nevcvx.png",
    __v: 0,
  },
];

const CustomerHomePage = () => {
  const dispatch = useDispatch();
  const location = useSelector((state) => state.location.selected);
  const [locationText, setLocationText] = useState("");

  const handleLocationPress = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission is required");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      const addressArray = await Location.reverseGeocodeAsync(coords);
      const address = addressArray[0];
      const formatted = `${address.name || ""}, ${address.street || ""}, ${
        address.city || ""
      }, ${address.region || ""}, ${address.country || ""}`;

      setLocationText(formatted);
      dispatch(setSelectedLocation({ ...coords, address, formatted }));
    } catch (error) {
      console.error("Failed to get location", error);
    }
  };

  return (
    <View>
      <ScrollView className="bg-white">
        <View className="bg-white">
          <View className="overflow-hidden bg-white">
            <View className="relative bg-white h-[300px] mb-[31px]">
              <TouchableOpacity className="absolute top-4 right-4 bg-muted-100 p-2 rounded-full z-10">
                <Image
                  source={icons.notification}
                  className="w-5 h-5"
                  resizeMode="contain"
                  tintColor={colors.primary}
                />
              </TouchableOpacity>
              <Image
                source={images.homeServices}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Location Search */}
            <View className="absolute left-0 bottom-0 flex-row w-full justify-between items-center gap-4 px-5 mt-4">
              <Pressable
                className="flex-1 flex-row min-h-[62px] bg-muted-100 rounded-xl justify-center items-center gap-5 px-5"
                onPress={handleLocationPress}
              >
                <Image
                  source={icons.location}
                  resizeMode="contain"
                  className="w-6 h-6"
                  tintColor={colors.primary}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-1"
                >
                  <Text
                    className="py-2 text-base font-pregular text-text"
                    style={{ includeFontPadding: false }}
                  >
                    {locationText || "Tap to detect your location"}
                  </Text>
                </ScrollView>
                <Image
                  source={
                    <Ionicons
                      name={"chatbox"}
                      size={20}
                      color={colors.primary}
                    />
                  }
                  resizeMode="contain"
                  className="w-6 h-6"
                  tintColor={colors.primary}
                />
              </Pressable>

              <TouchableOpacity className="items-center justify-center bg-muted-100 min-h-[62px] min-w-[62px] rounded-xl p-2">
                <Image
                  source={
                    <Ionicons
                      name={"chatbox"}
                      size={20}
                      color={colors.primary}
                    />
                  }
                  resizeMode="contain"
                  className="w-6 h-6"
                  tintColor={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Services Rows */}
          <View className="bg-white">
            <View className="px-5 mt-6 flex-row justify-between items-center">
              <Text className="text-lg font-psemibold text-primary">
                Service Categories
              </Text>
              <TouchableOpacity>
                <Link
                  href={customerRoutes.CUSTOMER_CATEGORIES}
                  className="text-muted font-pregular px-2"
                >
                  View All
                </Link>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={serviceCategories}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{
                marginTop: 6,
                paddingHorizontal: 20,
                paddingVertical: 10,
                gap: 16,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.3}
                  onPress={() => customerRoutes.CUSTOMER_SERVICES(item._id)}
                  className="items-center justify-center"
                >
                  <View className="w-20 h-20 items-center justify-center bg-muted-100 p-4 rounded-full mb-2">
                    <Image
                      source={{
                        uri:
                          item.icon ||
                          "https://res.cloudinary.com/abubakarmalik/image/upload/v1751765416/mechanic_nvpheo.png",
                      }}
                      resizeMode="contain"
                      className="w-10 h-10"
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="text-xs text-center w-20 text-text font-pregular leading-tight"
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Featured Section Cards */}
          <View className="bg-gray-100 mt-4">
            <View className="px-5 flex-row mt-6 justify-between items-center">
              <Text className="text-lg font-psemibold text-primary">
                Featured Services
              </Text>
              <TouchableOpacity>
                <Text className="text-muted font-pregular px-2">View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-6 px-5 mb-6 mr-4"
            >
              <View className="mr-4">
                <View className="rounded-2xl overflow-hidden w-80 h-52 bg-white">
                  <Image
                    source={images.gardening}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-3 left-3 bg-muted-100 px-3 py-2 rounded-full text-xs font-psemibold text-black">
                    GARDENING
                  </Text>
                </View>
              </View>
              <View className="mr-4">
                <View className="rounded-2xl overflow-hidden w-80 h-52 bg-white">
                  <Image
                    source={images.cleaning}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-3 left-3 bg-muted-100 px-3 py-2 rounded-full text-xs font-psemibold text-black">
                    CLEANING
                  </Text>
                </View>
              </View>
              <View className="mr-4">
                <View className="rounded-2xl overflow-hidden w-80 h-52 bg-white">
                  <Image
                    source={images.solarInstallation}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-3 left-3 bg-muted-100 px-3 py-2 rounded-full text-xs font-psemibold text-black">
                    SOLAR INSTALLATION
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Popular Services Grid */}
          <View className="bg-white">
            <View className="px-5 flex-row mt-6 justify-between items-center">
              <Text className="text-lg font-psemibold text-primary">
                Popular Services
              </Text>
              <TouchableOpacity>
                <Text className="text-muted font-pregular px-2">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between mt-4 px-5 mb-6">
              {serviceCategories.slice(0, 6).map((item) => (
                <Link
                  key={`popular-${item._id}`}
                  href={customerRoutes.CUSTOMER_SERVICES(item._id)}
                  asChild
                >
                  <TouchableOpacity className="w-[48%] mb-4">
                    <View className="flex-row w-full gap-3 bg-gray-50 rounded-xl p-4 shadow-sm">
                      <View className="w-12 h-12 items-center justify-center bg-primary/10 rounded-lg">
                        <Image
                          source={{ uri: item.icon }}
                          resizeMode="contain"
                          className="w-6 h-6"
                          tintColor={colors.primary}
                        />
                      </View>
                      <Text className="flex-1 text-sm font-pregular text-gray-800">
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CustomerHomePage;
