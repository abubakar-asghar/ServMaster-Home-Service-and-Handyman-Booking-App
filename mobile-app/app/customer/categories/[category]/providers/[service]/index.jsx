import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../../../components/ui/TabHeader";
import { useLocalSearchParams } from "expo-router";
import { useGetProvidersByService } from "../../../../../../hooks/useProvider";

const ServiceProvidersBooking = () => {
  const { service } = useLocalSearchParams();

  const { data, error, isPending } = useGetProvidersByService(service);

  return (
    <SafeAreaView>
      <TabHeader title={"Book Service"} goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5 w-full">
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceProvidersBooking;
