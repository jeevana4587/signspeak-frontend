import React, { useEffect, useState, useRef } from "react";

function GesturePredict({ latestLandmarks }) {
  const [gesture, setGesture] = useState("-");
  const [sentence, setSentence] = useState("");

  const lastPrediction = useRef("");
  const stableCount = useRef(0);

  console.log("🔥 Received landmarks:", latestLandmarks);

  useEffect(() => {
    if (!latestLandmarks) return;

    const sendData = async () => {
      try {
        console.log("📤 Sending landmarks...");

        const flattened = latestLandmarks.flatMap(p => [p.x, p.y, p.z]);

        const res = await fetch("http://localhost:5000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ landmarks: flattened }),
        });

        console.log("📡 Status:", res.status);

        const data = await res.json();
        console.log("🟢 RESPONSE:", data);

        if (!data.gesture) {
          console.warn("⚠️ No gesture received");
          return;
        }

        const current = data.gesture.trim();

        console.log("✅ Prediction:", current);

        setGesture(current);

        // 🧠 Stability logic
        if (current === lastPrediction.current) {
          stableCount.current++;
        } else {
          stableCount.current = 0;
        }

        lastPrediction.current = current;

        // ✅ Add to sentence when stable
        if (stableCount.current >= 3) {

          // 🔥 SPACE
          if (current === "SPACE") {
            setSentence(prev => prev + " ");
          }

          // 🔥 DELETE
          else if (current === "DEL") {
            setSentence(prev => prev.slice(0, -1));
          }

          // 🔤 NORMAL LETTER
          else {
            setSentence(prev => prev + current);
          }

          stableCount.current = 0;

          // 🔥 Prevent immediate duplicate letters
          setTimeout(() => {
            lastPrediction.current = "";
          }, 800);
        }

      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
      }
    };

    sendData();

  }, [latestLandmarks]);

  // 🔊 Speak
  const speak = () => {
    if (!sentence) return;
    const speech = new SpeechSynthesisUtterance(sentence);
    speechSynthesis.speak(speech);
  };

  // 🧹 Clear
  const clearText = () => {
    setSentence("");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Current Letter</h2>
      <h1 style={{ fontSize: "50px", color: "#00ffcc" }}>
        {gesture}
      </h1>

      <h2>Sentence</h2>
      <h1 style={{ fontSize: "40px" }}>
        {sentence || "_"}
      </h1>

      <button onClick={speak}>🔊 Speak</button>
      <button onClick={clearText}>Clear</button>
    </div>
  );
}

export default GesturePredict;