import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export function startHandTracking(video, canvas){
  const ctx = canvas.getContext("2d");

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  hands.onResults((results) => {
    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((hand) => {
        drawConnectors(ctx, hand, HAND_CONNECTIONS);
        drawLandmarks(ctx, hand);
      });

      // 🔹 Clean output (for Member 4)
      const cleanLandmarks = results.multiHandLandmarks.map((hand) =>
        hand.map((p) => ({ x: p.x, y: p.y, z: p.z }))
      );

      console.log("Hand landmarks:", cleanLandmarks);
    }
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  camera.start();
}
