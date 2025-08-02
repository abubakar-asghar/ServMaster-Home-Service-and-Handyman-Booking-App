import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import TabHeader from "../../../components/ui/TabHeader";
import SearchBar from "../../../components/ui/SearchBar";
import { router } from "expo-router";
import { useGetAllCustomerChats } from "../../../hooks/useChat";
import { colors } from "../../../constants/colors";
import { icons } from "../../../constants";
import ChatSkeleton from "../../../components/skeletons/chat/ChatSkeleton";
import { useChatStore } from "../../../zustand/chatStore";
import { useSelector } from "react-redux";
import { customerRoutes } from "../../../lib/routes";

const CustomerChat = () => {
  const { selectedChat, setSelectedChat } = useChatStore();
  const { data, isPending: isLoadingChats, error } = useGetAllCustomerChats();

  const chats = data?.data || [];

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    router.push(customerRoutes.CUSTOMER_CHAT_MESSAGES(chat._id));
  };

  useEffect(() => {
    // console.log("Fetched Chats:", chats);
  }, [data?.data]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="Chat" />

      {/* Loading */}
      {isLoadingChats ? (
        <ChatSkeleton />
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-center">
            Failed to load chats. Please try again later.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 p-5">
            {/* Search */}
            <View className="mb-6">
              <SearchBar
                placeholder="Search chat..."
                disabled={chats.length === 0}
              />
            </View>

            {/* Chats */}
            {chats.length === 0 ? (
              <View className="flex-1 justify-center items-center px-5">
                <View className="bg-primary/10 p-6 rounded-full mb-5">
                  <Image
                    source={icons.message}
                    className="w-14 h-14"
                    tintColor={colors.primary}
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-xl font-psemibold text-gray-800 mb-2">
                  No Conversation
                </Text>
                <Text className="text-center text-gray-500">
                  You didn't make any conversation yet.
                </Text>
                <Text className="text-center text-gray-500">
                  Please book a service to chat with a provider.
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {chats.map((chat) => {
                  const participant = chat.participants.find(
                    (p) => p.participantType === "ServiceProvider"
                  )?.user;

                  return (
                    <TouchableOpacity
                      key={chat._id}
                      className="flex-row items-center py-3"
                      activeOpacity={0.7}
                      onPress={() => handleSelectChat(chat)}
                    >
                      <Image
                        source={
                          participant?.profilePic
                            ? { uri: participant.profilePic }
                            : icons.profile
                        }
                        className="w-14 h-14 rounded-full mr-4"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-text font-psemibold text-base">
                            {participant?.fullName || "Service Provider"}
                          </Text>
                          <Text className="text-muted text-xs">
                            {new Date(chat.updatedAt)
                              .toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text
                            className={`${
                              chat.lastMessage?.seen
                                ? "font-pregular"
                                : "font-psemibold"
                            } text-muted text-sm flex-1`}
                            numberOfLines={1}
                          >
                            {chat.lastMessage?.text || "Start chatting..."}
                          </Text>
                          {!chat.lastMessage?.seen && (
                            <View className="w-3 h-3 rounded-full bg-primary ml-2" />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default CustomerChat;
