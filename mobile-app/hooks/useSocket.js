import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  socket = io("http://192.168.0.104:5000");

  socket.on("connect", () => {
    console.log("Connected to socket server");
  });

  return socket;
};

export const getSocket = () => socket;
