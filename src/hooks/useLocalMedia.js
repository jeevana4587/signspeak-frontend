// src/hooks/useLocalMedia.js

import { useEffect, useRef, useState } from "react";
import { getLocalStream } from "../media/getUserMedia";

export default function useLocalMedia() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let active = true;

    getLocalStream().then((mediaStream) => {
      if (!active) return;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    });

    return () => {
      active = false;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return { videoRef, stream };
}
