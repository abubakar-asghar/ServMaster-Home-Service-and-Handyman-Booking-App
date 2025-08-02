import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useGetProviderProfileForCustomer } from "../../../hooks/useProvider";
import TabHeader from "../../ui/TabHeader";
import { images } from "../../../constants";

const ProvidersProfile = ({ providerId }) => {
  const router = useRouter();

  const { data, isPending, error } =
    useGetProviderProfileForCustomer(providerId);

  const [provider, setProvider] = useState(null);
  useEffect(() => {
    if (data?.data) {
      setProvider(data.data);
    }
  }, [data]);

  return (
    <View className="flex-1 bg-white">
      <TabHeader title={"About Provider"} goBack />

      {isPending ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="small" />
          <Text className="mt-2 text-gray-500">
            Loading service provider profile ...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-red-500">Failed to load service provider.</Text>
        </View>
      ) : data?.data ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: "white",
          }}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center pt-8 pb-4 mb-5">
            <Image source={images.step3} className="w-24 h-24 rounded-full" />
            <Text className="mt-3 text-xl font-psemibold text-text">
              {provider.fullName}
            </Text>
            <Text className="text-text text-sm font-pregular">
              {provider.phone}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <Text className="text-gray-500">
            No service provider profile available.
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProvidersProfile;
