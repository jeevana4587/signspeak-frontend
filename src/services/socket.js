import { io } from "socket.io-client";


const SOCKET_SERVER_URL = (" https://unbadgered-junie-cyclostomatous.ngrok-free.dev",{
extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  }
});
export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false
});
