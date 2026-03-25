import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://192.168.0.120:5000";

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false
});
