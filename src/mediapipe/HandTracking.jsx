import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export let latestLandmarks = null;

export default function HandTracking({ videoRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef?.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      // console.log("MediaPipe running", results);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks?.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
        drawLandmarks(ctx, landmarks);

        latestLandmarks = landmarks;
      } else {
        latestLandmarks = null;
      }
    });

    const processFrame = async () => {
      if (video.readyState === 4 && video.videoWidth !== 0) {
        await hands.send({ image: video });
      }
      requestAnimationFrame(processFrame);
    };

    processFrame();

  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}