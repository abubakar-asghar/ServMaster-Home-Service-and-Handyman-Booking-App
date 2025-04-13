import { View, Text, ScrollView, Image, TextInput } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images, colors } from "../../constants";

const CustomerHomePage = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Image
            source={images.step2}
            resizeMode="contain"
            className="w-6 h-6"
            tintColor={colors.primary}
          />
          <View>
            <View>
              <Image
                source={icons.location}
                resizeMode="contain"
                className="w-6 h-6"
                tintColor={colors.primary}
              />
              <TextInput />
              <Image
                source={icons.aim}
                resizeMode="contain"
                className="w-6 h-6"
                tintColor={colors.primary}
              />
            </View>
            <View>
              <Image
                source={icons.search}
                resizeMode="contain"
                className="w-6 h-6"
                tintColor={colors.primary}
              />
            </View>
          </View>

          {/* Categories Rows */}
          <View className="flex-row justify-between mt-4 px-4">
            <Text>Services</Text>
            <Text>View All</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 mt-2 px-4">
              <Text>Category 1</Text>
              <Text>Category 2</Text>
              <Text>Category 3</Text>
              <Text>Category 4</Text>
            </View>
          </ScrollView>

          {/* Featured Section Cards */}
          <View className="flex-row justify-between mt-4 px-4">
            <Text>Featured</Text>
            <Text>View All</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4 mt-2 px-4">
              <Text>Featured Card 1</Text>
              <Text>Featured Card 2</Text>
              <Text>Featured Card 3</Text>
              <Text>Featured Card 4</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerHomePage;
