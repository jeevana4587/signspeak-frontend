import { useEffect, useState, useRef } from "react";
import HandTracking, { latestLandmarks } from "../mediapipe/HandTracking";

export default function GesturePredict() {
  const [text, setText] = useState("Show a gesture");

  const lastGesture = useRef("");
  const stableCount = useRef(0);

  // 🔹 Better Finger Detection
  const getFingerStates = (lm) => {
    const isExtended = (tip, pip) => {
      return lm[tip].y < lm[pip].y - 0.02; // tolerance
    };

    // Palm reference
    const palm = lm[0];

    // Thumb detection using distance from palm
    const thumbDistance = Math.abs(lm[4].x - palm.x);
    const thumb = thumbDistance > 0.08;

    const index = isExtended(8, 6);
    const middle = isExtended(12, 10);
    const ring = isExtended(16, 14);
    const pinky = isExtended(20, 18);

    return [thumb, index, middle, ring, pinky];
  };

  // 🔹 Gesture Rules (Order Matters)
  const detectGesture = (f) => {
    const [thumb, index, middle, ring, pinky] = f;

    // Thumb Up
    if (thumb && !index && !middle && !ring && !pinky)
      return "Yes";

    // Fist
    if (!thumb && !index && !middle && !ring && !pinky)
      return "Stop";

    // Open Palm
    if (thumb && index && middle && ring && pinky)
      return "Hello";

    // Peace
    if (!thumb && index && middle && !ring && !pinky)
      return "Okay";

    // Point
    if (!thumb && index && !middle && !ring && !pinky)
      return "Point";

    return "";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!latestLandmarks) return;

      const fingers = getFingerStates(latestLandmarks);
      const gesture = detectGesture(fingers);

      if (!gesture) return;

      if (gesture === lastGesture.current) {
        stableCount.current += 1;
      } else {
        stableCount.current = 0;
        lastGesture.current = gesture;
      }

      // Require stability for ~0.6s
      if (stableCount.current > 6) {
        setText(gesture);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div
        style={{
          width: "40%",
          background: "#020c1b",
          color: "white",
          padding: "40px",
        }}
      >
        <h1>Gesture Recognition</h1>
        <h2>Detected Text</h2>
        <h1 style={{ color: "#38bdf8", marginTop: "30px" }}>
          {text}
        </h1>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "60%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a192f",
        }}
      >
        <HandTracking />
      </div>
    </div>
  );
}