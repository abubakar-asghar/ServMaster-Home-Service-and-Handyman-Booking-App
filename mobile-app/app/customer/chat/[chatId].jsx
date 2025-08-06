import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { icons } from "../../../constants";
import TabHeader from "../../../components/ui/TabHeader";
import { useLocalSearchParams, router } from "expo-router";
import { useSelector } from "react-redux";
import {
  useGetChatMessages,
  useSendMessageWithSocket,
} from "../../../hooks/useChat";
import MessagesSkeleton from "../../../components/skeletons/chat/MessagesSkeleton";
import { useChatStore } from "../../../zustand/chatStore";
import { getSocket } from "../../../utils/socket";
import { customerRoutes } from "../../../lib/routes";

const MessagesScreen = () => {
  const { chatId } = useLocalSearchParams();
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    messages,
    selectedChat,
    setSelectedChat,
    setMessages,
    addMessage,
    markMessagesAsSeen,
    socket,
  } = useChatStore();

  const {
    data,
    isPending: isLoadingMessages,
    error,
    refetch,
  } = useGetChatMessages(chatId);

  // Set initial messages and mark as seen
  useEffect(() => {
    if (data?.data) {
      setMessages(data.data);
      markMessagesAsSeen(chatId);

      // Update last message in chat list
      if (data.data.length > 0) {
        setSelectedChat((prev) => ({
          ...prev,
          lastMessage: data.data[data.data.length - 1],
        }));
      }
    }
  }, [data?.data]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join the chat room
    socket.emit("joinChat", chatId);

    const handleNewMessage = (newMessage) => {
      if (newMessage.chat === chatId) {
        addMessage(newMessage);
        // Notify server that message was received
        socket.emit("messageReceived", {
          chatId,
          messageId: newMessage._id,
        });
      }
    };

    const handleMessageSeen = ({ chatId: seenChatId }) => {
      if (seenChatId === chatId) {
        markMessagesAsSeen(chatId);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.emit("leaveChat", chatId);
    };
  }, [socket, chatId]);

  // Scroll to bottom when messages change or keyboard appears
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, keyboardHeight]);

  // Keyboard listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const payload = {
      chatId,
      content: {
        text: message.trim(),
        sender: user._id,
        senderType: "Customer", // Explicitly set as Customer
      },
    };

    try {
      // Optimistically add message
      const tempMessage = {
        _id: Date.now().toString(),
        chat: chatId,
        text: message.trim(),
        sender: user._id,
        senderType: "Customer",
        createdAt: new Date().toISOString(),
        seen: false,
      };
      addMessage(tempMessage);
      setMessage("");

      // Send via socket
      await sendMessageWithSocket(payload);

      // Refetch messages to ensure consistency
      await refetch();
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to send message");
    }
  };

  const renderItem = ({ item }) => {
    const fromMe =
      item?.sender === user?._id || item?.sender?._id === user?._id;
    const isTextMessage = item?.type === "text" || !item?.type;

    return (
      <View
        className={`max-w-[75%] mb-3 px-4 py-2 rounded-b-2xl ${
          fromMe
            ? "self-end bg-primary rounded-tl-2xl"
            : "self-start bg-muted-100 rounded-tr-2xl"
        }`}
      >
        {isTextMessage ? (
          <>
            <Text
              className={`text-sm font-pmedium ${
                fromMe ? "text-white" : "text-text"
              }`}
            >
              {item?.text}
            </Text>
            <View className="flex-row items-center justify-end space-x-1 mt-1">
              <Text
                className={`text-xs ${fromMe ? "text-white/70" : "text-muted"}`}
              >
                {new Date(item.createdAt)
                  .toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
              </Text>
              {fromMe && (
                <Image
                  source={item.seen ? icons.seen : icons.sent}
                  className="w-3 h-3"
                  tintColor={fromMe ? "rgba(255,255,255,0.7)" : "#6B7280"}
                />
              )}
            </View>
          </>
        ) : (
          <Text className="text-sm font-pmedium text-text">
            [Unsupported message type]
          </Text>
        )}
      </View>
    );
  };

  if (!selectedChat) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TabHeader title="Chat" goBack={customerRoutes.CUSTOMER_CHATS} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted">Select a chat to continue</Text>
          <TouchableOpacity
            onPress={() => router.push(customerRoutes.CUSTOMER_CHATS)}
            className="mt-4 bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Back to Chats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TabHeader
        title={
          selectedChat?.participants?.find(
            (p) => p.participantType === "ServiceProvider"
          )?.user?.fullName || "Service Provider"
        }
        goBack={customerRoutes.CUSTOMER_CHATS}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        <View className="flex-1">
          {isLoadingMessages ? (
            <MessagesSkeleton />
          ) : error ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-red-500 text-center px-5">
                Failed to load messages. Please try again.
              </Text>
              <TouchableOpacity
                onPress={refetch}
                className="mt-4 bg-primary px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item?._id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-muted">No messages yet</Text>
                  <Text className="text-muted mt-1">
                    Start the conversation with your service provider
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <View
          className="bg-white p-4 border-t border-gray-200"
          style={{
            marginBottom: keyboardHeight
              ? Math.max(0, keyboardHeight - (Platform.OS === "ios" ? 30 : 0))
              : 0,
          }}
        >
          <View className="flex-row items-center space-x-3 gap-1">
            <View className="flex-row flex-1 items-center bg-muted-100 rounded-xl">
              <View className="flex-1 px-4 py-2">
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type your message..."
                  placeholderTextColor="#9CA3AF"
                  className="text-base font-pregular text-text"
                  multiline
                  editable={!isLoadingMessages}
                  onSubmitEditing={handleSend}
                />
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Info", "File attachment coming soon")
                }
                className="p-4"
                disabled={isLoadingMessages}
              >
                <Image
                  source={icons.attach}
                  className="w-7 h-7"
                  tintColor="#6B7280"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSend}
              className="p-4 rounded-2xl bg-primary"
              disabled={!message.trim() || isLoadingMessages}
            >
              <Image
                source={icons.send}
                className="w-7 h-7"
                tintColor="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessagesScreen;

// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   FlatList,
//   SafeAreaView,
//   Keyboard,
//   Alert,
// } from "react-native";
// import { icons } from "../../../constants";
// import TabHeader from "../../../components/ui/TabHeader";
// import { useLocalSearchParams } from "expo-router";
// import { useSelector } from "react-redux";
// import {
//   useGetChatMessages,
//   useSendMessage,
//   useSendMessageWithSocket,
// } from "../../../hooks/useChat";
// import MessagesSkeleton from "../../../components/skeletons/chat/MessagesSkeleton";
// import { useChatStore } from "../../../zustand/chatStore";
// import { socket } from "../../../utils/socket";

// const MessagesScreen = () => {
//   const { chatId } = useLocalSearchParams();
//   const { user } = useSelector((state) => state.auth);
//   const [message, setMessage] = useState("");
//   const flatListRef = useRef(null);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);

//   const { messages, setMessages, addMessage } = useChatStore();

//   const {
//     data,
//     isPending: isLoadingMessages,
//     error,
//   } = useGetChatMessages(chatId);

//   // const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();
//   const { mutateAsync: sendMessageWithSocket, isPending: isSending } =
//     useSendMessageWithSocket();

//   // ✅ Load messages initially
//   useEffect(() => {
//     if (data?.data) {
//       setMessages(data.data);
//     }
//   }, [data?.data]);

//   // ✅ Socket join + listen
//   useEffect(() => {
//     if (!chatId) return;

//     socket.emit("joinChat", chatId);

//     const handleNewMessage = (newMessage) => {
//       if (newMessage.chat === chatId) {
//         addMessage(newMessage);
//       }
//     };

//     socket.on("newMessage", handleNewMessage);

//     return () => {
//       socket.off("newMessage", handleNewMessage);
//     };
//   }, [chatId]);

//   // ✅ Scroll to bottom
//   useEffect(() => {
//     if (messages.length > 0) {
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//     }
//   }, [messages, keyboardHeight]);

//   // ✅ Handle keyboard offset
//   useEffect(() => {
//     const show = Keyboard.addListener("keyboardDidShow", (e) => {
//       setKeyboardHeight(e.endCoordinates.height);
//     });
//     const hide = Keyboard.addListener("keyboardDidHide", () => {
//       setKeyboardHeight(0);
//     });

//     return () => {
//       show.remove();
//       hide.remove();
//     };
//   }, []);

//   const handleSend = async () => {
//     if (!message.trim() || isSending) return;

//     const payload = {
//       chatId,
//       content: { text: message.trim() },
//     };

//     try {
//       await sendMessageWithSocket(payload);
//       setMessage("");
//     } catch (error) {
//       Alert.alert("Error", error?.message || "Error sending message.");
//     }
//   };

//   const renderItem = ({ item }) => {
//     if (!item?._id) return null;

//     const fromMe =
//       item?.sender === user?._id || item?.sender?._id === user?._id;

//     return (
//       <View
//         className={`max-w-[75%] mb-3 px-4 py-2 rounded-b-2xl ${
//           fromMe
//             ? "self-end bg-primary rounded-tl-2xl"
//             : "self-start bg-muted-100 rounded-tr-2xl"
//         }`}
//       >
//         <Text
//           className={`text-sm font-pmedium ${
//             fromMe ? "text-white" : "text-text"
//           }`}
//         >
//           {item?.text || ""}
//         </Text>
//         <Text
//           className={`text-xs mt-1 self-end ${
//             fromMe ? "text-white/70" : "text-muted"
//           }`}
//         >
//           {item?.createdAt
//             ? new Date(item.createdAt)
//                 .toLocaleTimeString("en-GB", {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   hour12: true,
//                 })
//                 .toUpperCase()
//             : ""}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <TabHeader title="Chat" goBack={customerRoutes.CUSTOMER_CHATS}  />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//         style={{ flex: 1 }}
//       >
//         <View style={{ flex: 1 }}>
//           {isLoadingMessages ? (
//             <MessagesSkeleton />
//           ) : error ? (
//             <View className="flex-1 justify-center items-center">
//               <Text className="text-red-500 text-center px-5">
//                 Failed to load messages.
//               </Text>
//             </View>
//           ) : (
//             <FlatList
//               ref={flatListRef}
//               data={messages}
//               keyExtractor={(item) => item?._id}
//               renderItem={renderItem}
//               contentContainerStyle={{ padding: 16 }}
//               showsVerticalScrollIndicator={false}
//               onContentSizeChange={() =>
//                 flatListRef.current?.scrollToEnd({ animated: true })
//               }
//               onLayout={() =>
//                 flatListRef.current?.scrollToEnd({ animated: true })
//               }
//             />
//           )}
//         </View>

//         {/* ✅ Message input */}
//         <View
//           className="bg-white p-4 border-t border-gray-200"
//           style={{
//             marginBottom: keyboardHeight
//               ? Math.max(0, keyboardHeight - (Platform.OS === "ios" ? 30 : 0))
//               : 0,
//           }}
//         >
//           <View className="flex-row items-center space-x-3 gap-1">
//             <View className="flex-row flex-1 items-center bg-muted-100 rounded-xl">
//               <View className="flex-1 px-4 py-2">
//                 <TextInput
//                   value={message}
//                   onChangeText={setMessage}
//                   placeholder="Type your message..."
//                   placeholderTextColor="#9CA3AF"
//                   className="text-base font-pregular text-text"
//                   multiline
//                   editable={!isLoadingMessages}
//                 />
//               </View>
//               <TouchableOpacity
//                 onPress={() => console.log("Attach file")}
//                 className="p-4"
//                 disabled={isLoadingMessages}
//               >
//                 <Image
//                   source={icons.attach}
//                   className="w-7 h-7"
//                   tintColor="#6B7280"
//                 />
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity
//               onPress={handleSend}
//               className="p-4 rounded-2xl bg-primary"
//             >
//               <Image
//                 source={icons.send}
//                 className="w-7 h-7"
//                 tintColor="white"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default MessagesScreen;
