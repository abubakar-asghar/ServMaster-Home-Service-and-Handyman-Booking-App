import { useQuery } from "@tanstack/react-query";
import { getAllChats } from "../api/services/chatApi";

export const useGetAllChats = () => {
  return useQuery({
    queryKey: ["user-chats"],
    queryFn: getAllChats,
  });
};
