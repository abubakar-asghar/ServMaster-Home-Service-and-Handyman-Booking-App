import * as SecureStore from "expo-secure-store";

export const saveUserToStorage = async ({ user, token, role }) => {
  await SecureStore.setItemAsync("auth", JSON.stringify({ user, token, role }));
};

export const getUserFromStorage = async () => {
  const result = await SecureStore.getItemAsync("auth");
  return result ? JSON.parse(result) : null;
};

export const clearStorage = async () => {
  await SecureStore.deleteItemAsync("auth");
};
