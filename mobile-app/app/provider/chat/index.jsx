import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import TabHeader from "../../../components/ui/TabHeader";
import SearchBar from "../../../components/ui/SearchBar";
import { router } from "expo-router";
import { useGetAllProviderChats } from "../../../hooks/useChat";
import { colors } from "../../../constants/colors";
import { icons } from "../../../constants";
import ChatSkeleton from "../../../components/skeletons/chat/ChatSkeleton";
import { useChatStore } from "../../../zustand/chatStore";
import { providerRoutes } from "../../../lib/routes";
import { MaterialIcons } from "@expo/vector-icons";

const ProviderChat = () => {
  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    onlineUsers,
    isConnected,
  } = useChatStore();

  const { data, isPending: isLoadingChats, error } = useGetAllProviderChats();

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    router.push(providerRoutes.PROVIDER_CHAT_MESSAGES(chat._id));
  };

  useEffect(() => {
    if (data?.data) {
      setChats(data.data); // Store fetched chats in the Zustand store
    }
  }, [data?.data]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader title="Chat" />

      {/* Connection Status */}
      {!isConnected && (
        <View className="bg-yellow-50 p-2 border-b border-yellow-200">
          <Text className="text-yellow-700 text-center text-sm">
            Connecting to chat service...
          </Text>
        </View>
      )}

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
                  No Conversations
                </Text>
                <Text className="text-center text-gray-500">
                  You don't have any active conversations yet.
                </Text>
                <Text className="text-center text-gray-500">
                  Customers will appear here when they message you.
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {chats.map((chat) => {
                  const participant = chat.participants.find(
                    (p) => p.participantType === "Customer"
                  )?.user;
                  const isOnline = onlineUsers.has(participant?._id);

                  return (
                    <TouchableOpacity
                      key={chat._id}
                      className="flex-row items-center py-3"
                      activeOpacity={0.7}
                      onPress={() => handleSelectChat(chat)}
                    >
                      <View className="relative">
                        <Image
                          source={
                            participant?.profilePic
                              ? { uri: participant.profilePic }
                              : icons.profile
                          }
                          className="w-14 h-14 rounded-full mr-4"
                          resizeMode="cover"
                        />
                        {isOnline && (
                          <View className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <View className="flex-row items-center">
                            <Text className="text-text font-psemibold text-base">
                              {participant?.fullName || "Customer"}
                            </Text>
                            {isOnline && (
                              <Text className="text-green-500 text-xs ml-2">
                                • Online
                              </Text>
                            )}
                          </View>
                          <Text className="text-muted text-xs">
                            {new Date(chat.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
                          <View className="flex-row items-center ml-2">
                            {chat.lastMessage?.sender === participant?._id && (
                              <MaterialIcons
                                name={
                                  chat.lastMessage?.seen ? "done-all" : "done"
                                }
                                size={14}
                                color={colors.primary}
                              />
                            )}
                            {!chat.lastMessage?.seen &&
                              chat.lastMessage?.sender !== participant?._id && (
                                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                          </View>
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

export default ProviderChat;
