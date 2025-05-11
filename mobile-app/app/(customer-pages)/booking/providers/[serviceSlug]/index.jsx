import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../../../components/ui/TabHeader";

const ServiceProvidersBooking = () => {
  return (
    <SafeAreaView>
      <TabHeader title={"Book Service"} goBack />
    </SafeAreaView>
  );
};

export default ServiceProvidersBooking;
