import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import FormField from "../../components/ui/FormField";
import CustomButton from "../../components/ui/CustomButton";
import { icons, images } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoginUser } from "../../hooks/useAuth";

const LoginScreen = () => {
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  // const [loading, setLoading] = useState(false);

  const { mutateAsync: loginUser, isPending } = useLoginUser();

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{11}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 11 digits.";
    } else if (!/^03\d{9}$/.test(form.phone)) {
      newErrors.phone = "Phone number must start with 03.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle Login Functionality
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await loginUser(form);
    } catch (error) {
      Alert.alert("Login Failed", "Invalid phone number or password.");
    }
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

          <Text className="text-2xl text-center text-primary mt-10 font-psemibold">
            Welcome Back
          </Text>

          <FormField
            placeholder={"Phone Number"}
            icon={icons.phoneNumber}
            value={form.phone}
            handleChangeText={(text) => setForm({ ...form, phone: text })}
            otherStyles="mt-7"
            keyboardType="phone-pad"
          />
          {errors.phone && <ErrorText error={errors.phone} />}

          <FormField
            placeholder={"Password"}
            icon={icons.password}
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            otherStyles="mt-7"
            secureTextEntry
          />
          {errors.password && <ErrorText error={errors.password} />}

          <TouchableOpacity className="mt-2 self-end">
            <Link
              href="/auth/forgot-password"
              className="text-primary text-md font-semibold"
            >
              Forgot Password?
            </Link>
          </TouchableOpacity>

          <CustomButton
            title="Login"
            handlePress={handleLogin}
            isLoading={isPending}
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

          <View className="flex-row justify-center mt-4">
            <Text className="text-lg text-muted font-pregular">
              Don't have an account?{" "}
            </Text>
            <Link
              href="/auth/select-role"
              className="text-lg font-psemibold text-primary"
            >
              Register
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
