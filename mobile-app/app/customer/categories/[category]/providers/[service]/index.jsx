import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../../../components/ui/TabHeader";
import { useLocalSearchParams } from "expo-router";
import { useGetProvidersByService } from "../../../../../../hooks/useProvider";

const ServiceProvidersBooking = () => {
  const { service } = useLocalSearchParams();

  const {data, error, isPending} = useGetProvidersByService(service);
  
  return (
    <SafeAreaView>
      <TabHeader title={"Book Service"} goBack />
    </SafeAreaView>
  );
};

export default ServiceProvidersBooking;
