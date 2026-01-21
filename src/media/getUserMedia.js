// src/media/getUserMedia.js

export async function getLocalStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    return stream;
  } catch (err) {
    console.error("Failed to access camera/mic", err);
    throw err;
  }
}
