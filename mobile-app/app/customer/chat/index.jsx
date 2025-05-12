import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabHeader from "../../../components/ui/TabHeader";
import SearchBar from "../../../components/ui/SearchBar";
import { images } from "../../../constants";
import { useRouter } from "expo-router";
import { useGetAllChats } from "../../../hooks/useChat";

const dummyChats = [
  {
    id: "1",
    profilePic: images.step1,
    fullName: "Azhar Plumber",
    lastMessage: "Sure, I'll be there at 2pm.",
    time: "12:45 PM",
    unread: true,
  },
  {
    id: "2",
    profilePic: images.step2,
    fullName: "Ahmad AC Service",
    lastMessage: "Thanks for the update.",
    time: "11:30 AM",
    unread: false,
  },
  {
    id: "3",
    profilePic: images.step3,
    fullName: "Umer Electrician",
    lastMessage: "Payment received. Thank you!",
    time: "Yesterday",
    unread: true,
  },
];

const CustomerChat = () => {
  const router = useRouter();

  const { data, isPending, error } = useGetAllChats();
  const [searchValue, setSearchValue] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    setChats(data?.data || []);
  }, [data]);

  const filteredChats = useMemo(() => {
    if (!searchValue.trim()) return chats;

    return chats.filter((item) =>
      item.user.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, chats]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="Chat" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Search */}
          <View className="mb-4">
            <SearchBar
              placeholder="Search Service Provider"
              value={searchValue}
              onChangeText={setSearchValue}
            />
          </View>

          {/* Chats */}
          <View className="space-y-4">
            {dummyChats.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => router.push(`/customer/chat/${item.id}`)}
              >
                <Image
                  source={item.profilePic}
                  className="w-14 h-14 rounded-full mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-text font-psemibold text-base">
                      {item.fullName}
                    </Text>
                    <Text className="text-muted text-xs">{item.time}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text
                      className={`${
                        item.unread ? "font-psemibold" : "font-pregular"
                      } text-muted text-sm`}
                      numberOfLines={1}
                    >
                      {item.lastMessage}
                    </Text>
                    {item.unread && (
                      <View className="w-3 h-3 rounded-full bg-primary ml-2" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerChat;
