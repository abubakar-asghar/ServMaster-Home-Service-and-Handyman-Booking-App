import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import FormField from "../../components/ui/FormField";
import CustomButton from "../../components/ui/CustomButton";
import { images } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push("/(tabs)/home"); // Navigate to home screen
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

          <Text className="text-2xl text-center text-primary mt-10 font-psemibold">
            Welcome Back
          </Text>

          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            otherStyles={"mt-10"}
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={password}
            handleChangeText={setPassword}
            otherStyles={"mt-7"}
            secureTextEntry
          />

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
            isLoading={loading}
            containerStyles="bg-primary mt-7"
          />

          <View className="flex-row justify-center mt-4">
            <Text className="text-lg text-muted font-pregular">
              Don't have an account?{" "}
            </Text>
            <Link href="/auth/select-role" className="text-lg font-psemibold text-primary">
              Register
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
