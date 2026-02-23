import { useState } from "react";
import HandTracking, { latestLandmarks } from "../mediapipe/HandTracking";
import "./GestureCapture.css";

export default function GestureCapture() {
  const [label, setLabel] = useState("hi");

  const captureSample = async () => {
    if (!latestLandmarks) {
      alert("No hand detected");
      return;
    }

    const flattened = latestLandmarks.flatMap(p => [
      p.x, p.y, p.z
    ]);

    await fetch("http://localhost:5000/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        landmarks: flattened,
      }),
    });

    alert("Sample saved");
  };

  return (
    <div className="page">
      <h1>Hand Tracking Demo</h1>

      <div className="camera-card">
        <HandTracking />
      </div>

      <div className="controls">
        <select onChange={(e) => setLabel(e.target.value)}>
          <option value="hi">hi</option>
          <option value="thank_you">thank_you</option>
        </select>

        <button onClick={captureSample}>
          Capture Sample
        </button>
      </div>
    </div>
  );
}
