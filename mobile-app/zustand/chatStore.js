import { create } from "zustand";

const useChatStore = create((set) => ({
  selectedChat: [],
  setSelectedChat: (selectedChat) => set({ selectedChat }),

  messages: {},
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
}));

export default useChatStore;
