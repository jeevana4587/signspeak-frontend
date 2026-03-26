import React, { useState } from "react";
import HandTracking from "./mediapipe/HandTracking";
import GesturePredict from "./pages/GesturePredict";

function App() {
  const [landmarks, setLandmarks] = useState(null);

  console.log("🚀 App landmarks:", landmarks); // 🔥 DEBUG

  return (
    <div style={{ textAlign: "center" }}>
      <h1>SignSpeak</h1>

      {/* Camera */}
      <HandTracking setLandmarks={setLandmarks} />

      {/* Prediction UI */}
      <GesturePredict latestLandmarks={landmarks} />
    </div>
  );
}

export default App;