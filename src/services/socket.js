import { io } from "socket.io-client";

// Use a simple string for the URL
const URL = "https://unbadgered-junie-cyclostomatous.ngrok-free.dev";

// Combine the ngrok header and the autoConnect setting into one object
export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
  extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  }
});