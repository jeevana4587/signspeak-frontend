import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://groutiest-groundlessly-catheryn.ngrok-free.dev";

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false
});
