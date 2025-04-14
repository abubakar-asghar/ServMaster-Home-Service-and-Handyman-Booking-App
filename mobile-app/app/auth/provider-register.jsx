import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";

import FormField from "../../components/ui/FormField";
import CustomButton from "../../components/ui/CustomButton";
import { icons, images } from "../../constants";

const ProviderRegister = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false); // For Terms & Privacy

  const handleRegister = () => {
    if (!agree) {
      alert("Please agree to Terms and Privacy Policy first.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/(tabs)/home");
    }, 2000);
  };

  return (
    <SafeAreaView className="bg-background h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logoTextH}
            className="w-full h-12"
            resizeMode="contain"
          />

          <Text className="text-2xl text-center text-text mt-10 font-psemibold">
            Register as{" "}
            <Text className="text-primary font-pbold">Service Provider</Text>
          </Text>

          {/* Form Fields */}
          <FormField
            title="Full Name"
            value={form.name}
            handleChangeText={(text) => setForm({ ...form, name: text })}
            otherStyles="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(text) => setForm({ ...form, email: text })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Phone Number"
            value={form.phone}
            handleChangeText={(text) => setForm({ ...form, phone: text })}
            otherStyles="mt-7"
            keyboardType="phone-pad"
          />

          <FormField
            title="Skills"
            value={form.skills}
            handleChangeText={(text) => setForm({ ...form, skills: text })}
            otherStyles="mt-7"
          />

          <FormField
            title="Experience"
            value={form.experience}
            handleChangeText={(text) => setForm({ ...form, experience: text })}
            otherStyles="mt-7"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            otherStyles="mt-7"
            secureTextEntry
          />

          {/* Terms and Conditions */}
          <View className="flex-row w-full px-2 items-center mt-7">
            <Checkbox
              value={agree}
              onValueChange={setAgree}
              color={agree ? "#007bff" : undefined}
            />
            <Text className="text-md text-muted font-pregular px-4">
              I agree to the{" "}
              <Text className="text-primary underline">Terms & Conditions</Text>{" "}
              and accept the{" "}
              <Text className="text-primary underline">Privacy Policy</Text>
            </Text>
          </View>

          <CustomButton
            title="Register"
            handlePress={handleRegister}
            isLoading={loading}
            containerStyles="bg-primary mt-7"
          />

          {/* Divider */}
          <View className="flex-row items-center justify-center my-7">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-2 text-muted font-pregular text-sm">
              Register using social account
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Buttons */}
          <CustomButton
            title="Continue with Google"
            icon={icons.google}
            handlePress={() => {}}
            isLoading={false}
            containerStyles="bg-primary"
          />

          {/* <CustomButton
            title="Continue with Facebook"
            icon={icons.facebook}
            handlePress={() => {}}
            isLoading={false}
            containerStyles="bg-primary mt-7"
          /> */}

          {/* Login Redirect */}
          <View className="flex-row justify-center mt-6 mb-4">
            <Text className="text-lg text-muted font-pregular">
              Already have an account?{" "}
            </Text>
            <Link href="/auth/login" className="text-lg font-psemibold text-primary">
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderRegister;
