import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetServiceCategories } from "../../../../hooks/useServices";
import TabHeader from "../../../../components/ui/TabHeader";
import SearchBar from "../../../../components/ui/SearchBar";
import CustomButton from "../../../../components/ui/CustomButton";
import { icons } from "../../../../constants";

const ProvidersServices = () => {
  // const { data, error, isPending } = useGetServiceCategories();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title={"My Services"} goBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-5">
          <View className="flex-row items-center justify-between gap-5">
            <SearchBar placeholder="Search Service Provider" />
            <CustomButton
              icon={icons.plus}
              containerStyles="bg-primary w-16"
              textStyles="text-white"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProvidersServices;
