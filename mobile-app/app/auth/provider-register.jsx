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
import { colors } from "../../constants/colors";

const ProviderRegister = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    password: "",
    confirmPassword: "",
  });
  const [gender, setGender] = useState("");
  const [genderModalVisible, setGenderModalVisible] = useState(false);
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

          <FormField
            // title="Full Name"
            placeholder={"Full Name"}
            icon={icons.profile}
            value={form.name}
            handleChangeText={(text) => setForm({ ...form, name: text })}
            otherStyles="mt-10"
          />

          {/* <FormField
            // title="Email"
            placeholder={"Email"}
            icon={icons.email}
            value={form.email}
            handleChangeText={(text) => setForm({ ...form, email: text })}
            otherStyles="mt-7"
            keyboardType="email-address"
          /> */}

          <FormField
            // title="Phone Number"
            placeholder={"Phone Number"}
            icon={icons.phoneNumber}
            value={form.phone}
            handleChangeText={(text) => setForm({ ...form, phone: text })}
            otherStyles="mt-7"
            keyboardType="phone-pad"
          />

          <FormField
            // title="Password"
            placeholder={"Password"}
            icon={icons.password}
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            otherStyles="mt-7"
            secureTextEntry
          />

          <FormField
            // title="Password"
            placeholder={"Confirm Password"}
            icon={icons.password}
            value={form.confirmPassword}
            handleChangeText={(text) =>
              setForm({ ...form, confirmPassword: text })
            }
            otherStyles="mt-7"
            secureTextEntry
          />

          {/* <FormField
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
          /> */}

          <TouchableOpacity
            onPress={() => setGenderModalVisible(true)}
            className="mt-7 h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 flex flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-4 mr-3">
                <Image
                  source={icons.genders} // Make sure you have a gender icon in your icons file
                  className="w-5 h-5"
                  tintColor={colors.primary}
                />
                <View className="w-[1px] h-10 bg-gray-300" />
              </View>
              <Text className="text-text font-psemibold text-base">
                {gender ? gender : "Select Gender"}
              </Text>
            </View>
            <Image
              source={icons.downArrow} // Or any arrow/dropdown icon
              className="w-4 h-4"
              tintColor={colors.muted.DEFAULT}
            />
          </TouchableOpacity>

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
            <Link
              href="/auth/login"
              className="text-lg font-psemibold text-primary"
            >
              Login
            </Link>
          </View>

          {genderModalVisible && (
            <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black bg-opacity-40">
              <View className="w-[80%] bg-white p-6 rounded-xl">
                <Text className="text-lg font-psemibold text-center mb-4 text-primary">
                  Select Gender
                </Text>
                {["Male", "Female"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setGender(item);
                      setGenderModalVisible(false);
                    }}
                    className="p-3 border border-gray-300 rounded-lg mb-3"
                  >
                    <Text className="text-center text-text font-pregular">
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => {
                    setGender("")
                    setGenderModalVisible(false)}}
                  className="mt-2"
                >
                  <Text className="text-center text-sm text-muted underline font-pregular">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderRegister;
