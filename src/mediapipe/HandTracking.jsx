import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

export default function HandTracking({ setLandmarks }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let camera;

    const init = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // 🔥 FIX 1: Use CDN (IMPORTANT)
      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.multiHandLandmarks?.length > 0) {
          const landmarks = results.multiHandLandmarks[0];

          drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
          drawLandmarks(ctx, landmarks);

          setLandmarks(landmarks);
        } else {
          setLandmarks(null);
        }
      });

      // 🔥 FIX 2: Use MediaPipe Camera (IMPORTANT)
      camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 640,
        height: 480,
      });

      camera.start();
    };

    init();

    return () => {
      if (camera) camera.stop();
    };
  }, []);

  return (
    <div>
      {/* 🔥 IMPORTANT FIX: muted + autoplay */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }}
      />

      <canvas ref={canvasRef} />
    </div>
  );
}