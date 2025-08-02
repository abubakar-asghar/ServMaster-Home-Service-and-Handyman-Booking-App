import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { clearStorage } from "../../utils/storage";
import { logoutUser } from "../../store/slices/authSlice";
import { useState } from "react";
import { colors } from "../../constants/colors";

const ProfileLogoutBtn = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await clearStorage();
    dispatch(logoutUser());

    router.replace("/auth/login");
    setLoading(false);
  };

  return (
    <Pressable
      className="flex-row items-center justify-center p-2 mt-7 mb-10"
      onPress={handleLogout}
    >
      <View className="relative">
        {loading && (
          <ActivityIndicator
            className="absolute left-20 bottom-1"
            color={colors.primary}
          />
        )}
        <Text className="text-lg text-primary font-psemibold text-center">
          Logout
        </Text>
      </View>
    </Pressable>
  );
};

export default ProfileLogoutBtn;
