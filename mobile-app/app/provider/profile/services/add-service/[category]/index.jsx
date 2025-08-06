import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import TabHeader from "../../../../../../components/ui/TabHeader";
import SearchBar from "../../../../../../components/ui/SearchBar";
import { useGetSubServicesByParent } from "../../../../../../hooks/useServices";
import { icons } from "../../../../../../constants";
import { colors } from "../../../../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../../../../../components/ui/CustomButton";
import { useAddServices } from "../../../../../../hooks/useProvider";
import { useSelector } from "react-redux";
import { providerRoutes } from "../../../../../../lib/routes";

export default function ServiceDetail() {
  const { user } = useSelector((state) => state.auth);
  const { category } = useLocalSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [servicesData, setServicesData] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  const {
    data,
    error,
    isPending: servicesLoading,
  } = useGetSubServicesByParent(category);
  const { mutateAsync: addServices, isPending: addingServices } =
    useAddServices();

  useEffect(() => {
    setServicesData(data?.data || []);
  }, [data]);

  const filteredServices = useMemo(() => {
    if (!servicesData || !user?.selectedServices) return [];

    const alreadySelectedIds = user.selectedServices.flatMap((entry) =>
      entry.services.map((s) => s.service?._id || s.service)
    );

    return servicesData
      .filter((item) => !alreadySelectedIds.includes(item._id))
      .filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
  }, [searchValue, servicesData, user?.selectedServices]);

  const canSubmit = useMemo(() => {
    const entries = Object.entries(selectedServices);
    if (entries.length === 0) return false;
    return entries.every(([_, details]) => {
      if (details.pricingType === "negotiable") return true;
      return details.price && !isNaN(details.price);
    });
  }, [selectedServices]);

  const servicesToSubmit = Object.entries(selectedServices).map(
    ([serviceId, details]) => ({
      serviceId,
      ...details,
    })
  );

  const handleAddServices = async () => {
    if (!canSubmit) return;
    try {
      await addServices({ category, services: servicesToSubmit });
      router.replace(providerRoutes.PROVIDER_CATEGORIES);
    } catch (error) {
      console.error("Failed to add services:", error);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50">
      {/* Header */}
      <TabHeader
        title="Select Services"
        goBack={providerRoutes.PROVIDER_CATEGORIES}
      />

      {/* Services List */}
      {servicesLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="mt-3 text-gray-500 font-pregular">
            Loading available services...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-10">
          <Ionicons name="warning-outline" size={40} color={colors.danger} />
          <Text className="mt-3 text-danger font-pmedium">
            Failed to load services
          </Text>
          <Text className="text-gray-500 font-pregular mt-1">
            Please try again later
          </Text>
        </View>
      ) : filteredServices.length === 0 ? (
        <View className="flex-1 items-center justify-center py-10">
          <Ionicons name="search-outline" size={40} color={colors.muted} />
          <Text className="mt-3 text-gray-500 font-pmedium">
            No services available
          </Text>
          <Text className="text-gray-400 font-pregular mt-1">
            {searchValue
              ? "Try a different search"
              : "All services are already selected"}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View className="px-5 pt-5">
            <SearchBar
              placeholder="Search services..."
              value={searchValue}
              onChangeText={setSearchValue}
              containerStyles="bg-white shadow-sm"
            />
          </View>

          {/* Selected Services Count */}
          {Object.keys(selectedServices).length > 0 && (
            <View className="px-5 mt-3">
              <Text className="text-primary font-pmedium">
                {Object.keys(selectedServices).length} service(s) selected
              </Text>
            </View>
          )}

          {/* Services List */}
          <View className="px-5 mt-3 space-y-3 gap-1">
            {filteredServices.map((item, idx) => (
              <View
                key={item._id + idx}
                className={`bg-white p-4 rounded-xl shadow-xs border ${
                  selectedServices[item._id]
                    ? "border-primary/30"
                    : "border-gray-100"
                }`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center mr-3">
                      <Image
                        source={icons.repairingService}
                        className="w-5 h-5"
                        tintColor={colors.primary}
                      />
                    </View>
                    <Text className="text-base font-psemibold text-gray-800 flex-1">
                      {item.name}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      if (selectedServices[item._id]) {
                        setSelectedServices((prev) => {
                          const newState = { ...prev };
                          delete newState[item._id];
                          return newState;
                        });
                      } else {
                        setSelectedServices((prev) => ({
                          ...prev,
                          [item._id]: {
                            pricingType: "negotiable",
                            price: null,
                          },
                        }));
                      }
                    }}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 ${
                        selectedServices[item._id]
                          ? "bg-primary border-primary"
                          : "border-gray-300"
                      }`}
                    />
                  </Pressable>
                </View>

                {selectedServices[item._id] && (
                  <View className="mt-4 ml-12 space-y-3">
                    {/* Pricing Type Selector */}
                    <Text className="text-sm font-pmedium text-gray-600">
                      Select pricing type:
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mt-1">
                      {["negotiable", "fixed", "per_hour", "per_day"].map(
                        (type) => (
                          <Pressable
                            key={type}
                            onPress={() =>
                              setSelectedServices((prev) => ({
                                ...prev,
                                [item._id]: {
                                  ...prev[item._id],
                                  pricingType: type,
                                },
                              }))
                            }
                            className={`px-3 py-2 rounded-lg border ${
                              selectedServices[item._id].pricingType === type
                                ? "bg-primary/10 border-primary"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-sm font-pmedium ${
                                selectedServices[item._id].pricingType === type
                                  ? "text-primary"
                                  : "text-gray-600"
                              }`}
                            >
                              {(function (ptype) {
                                const pricetype = ptype.replace("_", " ");
                                return `${pricetype
                                  .slice(0, 1)
                                  .toUpperCase()}${pricetype
                                  .slice(1)
                                  .toLowerCase()}`;
                              })(type)}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </View>

                    {/* Price Input if not negotiable */}
                    {selectedServices[item._id].pricingType !==
                      "negotiable" && (
                      <View className="mt-2">
                        <Text className="text-sm font-pmedium text-gray-600 mb-1">
                          Enter price
                        </Text>
                        <View className="relative">
                          <TextInput
                            keyboardType="numeric"
                            placeholder="Amount in PKR"
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-pregular pl-12"
                            onChangeText={(val) =>
                              setSelectedServices((prev) => ({
                                ...prev,
                                [item._id]: {
                                  ...prev[item._id],
                                  price: val.replace(/[^0-9]/g, ""),
                                },
                              }))
                            }
                            value={selectedServices[item._id].price || ""}
                          />
                          <View className="absolute left-3 top-3 h-8 w-8 bg-primary/10 rounded-lg items-center justify-center">
                            <Text className="text-primary font-pmedium">
                              Rs
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View className="px-5 py-4 bg-white border-t border-gray-100 shadow-sm">
        <View className="flex-row space-x-3 gap-4">
          <CustomButton
            title="Cancel"
            containerStyles="flex-1 bg-gray-100 border border-gray-200"
            textStyles="text-text"
            handlePress={() =>
              router.replace(providerRoutes.PROVIDER_CATEGORIES)
            }
            disabled={addingServices}
          />
          <CustomButton
            title={`Add ${Object.keys(selectedServices).length || ""}`}
            containerStyles={`flex-1 bg-primary`}
            textStyles="text-white"
            handlePress={handleAddServices}
            isLoading={addingServices}
            disabled={!canSubmit}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
