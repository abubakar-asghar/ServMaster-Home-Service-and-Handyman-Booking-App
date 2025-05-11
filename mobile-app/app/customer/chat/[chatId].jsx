import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../../../constants";
import TabHeader from "../../../components/ui/TabHeader";

const dummyMessages = [
  { id: "1", fromMe: false, text: "Hi! I saw your booking.", time: "10:00 AM" },
  {
    id: "2",
    fromMe: true,
    text: "Yes, I need AC servicing.",
    time: "10:01 AM",
  },
  {
    id: "3",
    fromMe: false,
    text: "Sure. Can I come around 12?",
    time: "10:02 AM",
  },
  {
    id: "4",
    fromMe: true,
    text: "Yes, that works. Thank you!",
    time: "10:03 AM",
  },
];

const MessagesScreen = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Send message:", message);
    setMessage("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TabHeader title="Provider Name" goBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {dummyMessages.map((msg) => (
            <View
              key={msg.id}
              className={`max-w-[75%] mb-3 px-4 py-2 rounded-b-2xl ${
                msg.fromMe
                  ? "self-end bg-primary rounded-tl-2xl"
                  : "self-start bg-muted-100 rounded-tr-2xl"
              }`}
            >
              <Text
                className={`text-sm font-pmedium max-w-[80%] ${
                  msg.fromMe ? "text-white" : "text-text"
                }`}
              >
                {msg.text}
              </Text>
              <Text
                className={`text-xs mt-1 self-end max-w-[80%] ${
                  msg.fromMe ? "text-white/70" : "text-muted"
                }`}
              >
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input + File Upload */}
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
          <View className="flex-row items-center space-x-3 gap-1 ">
            <View className="flex-row flex-1 items-center bg-muted-100 rounded-xl">
            {/* Message Input */}
            <View className="flex-1 px-4 py-2">
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                className="text-base font-pregular text-text"
                multiline
              />
            </View>
            {/* Attachment Button */}
            <TouchableOpacity
              onPress={() => console.log("Attach File")}
              className="p-4"
            >
              <Image
                source={icons.attach}
                className="w-7 h-7"
                tintColor="#6B7280"
              />
            </TouchableOpacity>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              className="p-4 rounded-2xl bg-primary"
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
