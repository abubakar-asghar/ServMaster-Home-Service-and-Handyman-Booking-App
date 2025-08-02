import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import FormField from "../../components/ui/FormField";
import CustomButton from "../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../../constants";
import Checkbox from "expo-checkbox";
import { useRegisterCustomer } from "../../hooks/useCustomer";
import { colors } from "../../constants/colors";
import { commonRoutes } from "../../lib/routes";

const ErrorText = ({ error }) => {
  return (
    <Text className="text-red-500 font-pregular text-sm mt-1 ml-2">
      {error}
    </Text>
  );
};

const CustomerRegister = () => {
  const [errors, setErrors] = useState({});
  const [agree, setAgree] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const { mutateAsync: registerCustomer, isPending } = useRegisterCustomer();

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!form.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{11}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 11 digits.";
    } else if (!/^03\d{9}$/.test(form.phone)) {
      newErrors.phone = "Phone number must start with 03.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!agree) {
      newErrors.agree = "You must agree to the Terms & Privacy Policy.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle Customer Registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const response = await registerCustomer(form);

      if (response.success) {
        // Redirect to OTP verification with phone number
        router.push({
          pathname: "/auth/verify-otp",
          params: { phone: form.phone },
        });
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
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

          <Text className="text-2xl text-center text-text mt-10 font-psemibold">
            Register as{" "}
            <Text className="text-primary font-pbold">Customer</Text>
          </Text>

          <FormField
            placeholder={"Full Name"}
            icon={icons.profile}
            value={form.fullName}
            handleChangeText={(text) => setForm({ ...form, fullName: text })}
            otherStyles="mt-10"
          />
          {errors.fullName && <ErrorText error={errors.fullName} />}

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

          <FormField
            placeholder={"Confirm Password"}
            icon={icons.password}
            value={form.confirmPassword}
            handleChangeText={(text) =>
              setForm({ ...form, confirmPassword: text })
            }
            otherStyles="mt-7"
            secureTextEntry
          />
          {errors.confirmPassword && (
            <ErrorText error={errors.confirmPassword} />
          )}

          {/* Terms and Conditions */}
          <View className="flex-row w-full px-2 items-center mt-7">
            <Checkbox
              value={agree}
              onValueChange={setAgree}
              color={agree ? colors.primary : undefined}
            />
            <Text className="text-md text-muted font-pregular px-4">
              I agree to the{" "}
              <Text className="text-primary underline">Terms & Conditions</Text>{" "}
              and accept the{" "}
              <Text className="text-primary underline">Privacy Policy</Text>
            </Text>
          </View>
          {errors.agree && <ErrorText error={errors.agree} />}

          <CustomButton
            title="Register"
            handlePress={handleRegister}
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

          <View className="flex-row justify-center mt-4 mb-4">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerRegister;
