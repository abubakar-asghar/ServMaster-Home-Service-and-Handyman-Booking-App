import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../components/ui/TabHeader";
import SearchBar from "../../../../components/ui/SearchBar";
import { useGetSubServicesByParent } from "../../../../hooks/useServices";
import { icons } from "../../../../constants";
import { colors } from "../../../../constants/colors";

export default function ServiceDetail() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [servicesData, setServicesData] = useState([]);

  const { data, error, isPending } = useGetSubServicesByParent(category);

  useEffect(() => {
    setServicesData(data?.data || []);
  }, [data]);

  // ✅ Filter services based on search input
  const filteredServices = useMemo(() => {
    if (!searchValue.trim()) return servicesData;

    return servicesData.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, servicesData]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="Services" goBack="/customer/services" />

      {/* Services List */}
      {isPending ? (
        <View className="flex-1 justify-center items-center bg-white">
          <Text className="text-lg text-gray-500">Loading...</Text>
        </View>
      ) : !isPending && !servicesData ? (
        <View className="flex-1 justify-center items-center bg-white">
          <Text className="text-lg text-gray-500">Service not found 😕</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: "white",
          }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* 🔍 Search Input */}
          <View className="mt-5">
            <SearchBar
              placeholder="Search services..."
              value={searchValue}
              onChangeText={setSearchValue}
            />
          </View>

          {/* List of Services */}
          <View className="mt-7">
            {filteredServices.length > 0 ? (
              filteredServices.map((item) => (
                <Pressable
                  key={item._id}
                  onPress={() => router.push(`/customers/categories/${category}/providers/${item.id}`)}
                  className="py-4 mb-4 flex-row items-center justify-between border-b-[1px] border-gray-200"
                >
                  <View className="flex-row items-center gap-6">
                    <Image
                      source={icons.repairingService}
                      className="w-6 h-6"
                      tintColor={colors.primary}
                    />
                    <Text className="text-base font-pmedium text-gray-800">
                      {item.name}
                    </Text>
                  </View>
                  <Image
                    source={icons.back}
                    className="w-5 h-5 ml-auto rotate-180"
                    tintColor={colors.primary}
                  />
                </Pressable>
              ))
            ) : (
              <Text className="text-gray-500 text-center mt-5">
                No results found.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
