import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export let latestLandmarks = null;

export default function HandTracking() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream;
    let hands;

    const init = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      hands = new Hands({
        locateFile: (file) =>
          `/node_modules/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results) => {
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

      const loop = async () => {
        await hands.send({ image: video });
        requestAnimationFrame(loop);
      };

      loop();
    };

    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ width: "640px", height: "480px" }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} />
    </div>
  );
}