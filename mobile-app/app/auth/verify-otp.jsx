import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import FormField from "../../components/ui/FormField";
import CustomButton from "../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../../constants";
import { colors } from "../../constants/colors";
import { commonRoutes } from "../../lib/routes";
import { useResendVerification, useVerifyUserPhone } from "../../hooks/useAuth";

const ErrorText = ({ error }) => {
  return (
    <Text className="text-red-500 font-pregular text-sm mt-1 ml-2">
      {error}
    </Text>
  );
};

const VerifyOTP = () => {
  const params = useLocalSearchParams();
  const { phone, from, message } = params;
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const { mutateAsync: verifyPhone, isPending } = useVerifyUserPhone();
  const { mutateAsync: resendVerification, isPending: isResending } =
    useResendVerification();

  // Show the message from login if it exists
  useEffect(() => {
    if (message) {
      Alert.alert("Info", message);
    }
  }, [message]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required.";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle OTP Verification
  const handleVerify = async () => {
    if (!validateForm()) return;

    try {
      const response = await verifyPhone({ phone, code: otp });

      if (response.success) {
        Alert.alert("Success", "Phone number verified successfully!");

        // If coming from login, we need to have user login again
        if (from === "login") {
          Alert.alert(
            "Success",
            "Your phone is now verified. Please login again.",
            [{ text: "OK", onPress: () => router.replace("/auth/login") }]
          );
        } else {
          Alert.alert("Success", "Your phone is now verified. Please login.", [
            { text: "OK", onPress: () => router.replace("/auth/login") },
          ]);
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Verification failed");
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    try {
      // Call your backend endpoint to resend OTP
      const data = await resendVerification(phone);

      if (data.success) {
        Alert.alert("Success", "New OTP has been sent to your phone");
        setResendDisabled(true);
        setCountdown(60);
      } else {
        Alert.alert(
          "Error",
          data.response?.data?.message || data.message || "Failed to resend OTP"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
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
            Verify Your Phone Number
          </Text>

          <Text className="text-md text-muted text-center mt-4 font-pregular">
            We've sent a 6-digit code to{" "}
            <Text className="font-psemibold">+92 {phone?.slice(1)}</Text>
          </Text>

          <FormField
            placeholder={"Enter 6-digit OTP"}
            icon={icons.lock}
            value={otp}
            handleChangeText={(text) => setOtp(text)}
            otherStyles="mt-10"
            keyboardType="number-pad"
            maxLength={6}
          />
          {errors.otp && <ErrorText error={errors.otp} />}

          <CustomButton
            title="Verify"
            handlePress={handleVerify}
            isLoading={isPending}
            containerStyles="bg-primary mt-7"
          />

          <View className="flex-row justify-center mt-4">
            <Text className="text-md text-muted font-pregular">
              Didn't receive code?{" "}
            </Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendDisabled}
            >
              <Text
                className={`text-md font-psemibold ${
                  resendDisabled ? "text-gray-400" : "text-primary"
                }`}
                disabled={isResending}
              >
                Resend {resendDisabled && `(${countdown}s)`}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-10">
            <Link
              href={commonRoutes.LOGIN}
              className="text-lg font-psemibold text-primary"
            >
              Back to Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyOTP;
