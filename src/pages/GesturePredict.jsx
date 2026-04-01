import { useEffect, useState, useRef } from "react";
import HandTracking, { latestLandmarks } from "../mediapipe/HandTracking";

export default function GesturePredict() {
  const [text, setText] = useState("Waiting...");
  const lastGesture = useRef("");
  const stableCount = useRef(0);

const detectGesture = (lm) => {
  if (!lm || lm.length < 21) return "No Hand Detected";

  // 1. Calibration
  const handSize = Math.sqrt(Math.pow(lm[0].x - lm[9].x, 2) + Math.pow(lm[0].y - lm[9].y, 2));
  const isUp = (tip, pip) => lm[tip].y < lm[pip].y - (handSize * 0.15);
  const dist = (p1, p2) => Math.sqrt(Math.pow(lm[p1].x - lm[p2].x, 2) + Math.pow(lm[p1].y - lm[p2].y, 2));

  // 2. Finger States
  const t = dist(4, 5) > handSize * 0.6; // Thumb out
  const i = isUp(8, 6);  // Index
  const m = isUp(12, 10); // Middle
  const r = isUp(16, 14); // Ring
  const p = isUp(20, 18); // Pinky

  // 3. Precision Checks
  const isPinching = dist(4, 8) < handSize * 0.3; // Awesome pinch
  const isHorizontal = Math.abs(lm[8].x - lm[5].x) > Math.abs(lm[8].y - lm[5].y);

  // --- THE UNIQUE LOGIC (PRIORITY ORDER) ---

  // 1. AWESOME 👌 (Index + Thumb PINCH, other 3 UP)
  if (isPinching && m && r && p) return "Awesome 👌";

  // 2. THREE 3️⃣ (Your Suggestion: Index + Middle + Ring UP, Pinky/Thumb DOWN)
  if (!t && i && m && r && !p) return "Three 3️⃣";

  // 3. THANK YOU ✋ (Horizontal/Sideways Hand)
  if (isHorizontal && i && m && r && p) return "Thank You ✋";

  // 4. FOUR 4️⃣ (Index, Middle, Ring, Pinky UP, Thumb tucked)
  if (!t && i && m && r && p) return "Four 4️⃣";

  // 5. OKAY ✅ (Thumb, Index, Middle UP and spread)
  if (t && i && m && !r && !p) return "Okay ✅";

  // 6. HELLO 👋 (All 5 fingers up and Vertical)
  if (!isHorizontal && t && i && m && r && p) return "Hello 👋";

  // --- REST OF THE SIGNS ---
  if (i && !m && !r && !p) {
    return (t && isHorizontal) ? "Gun 🔫" : "Point ☝️";
  }
  if (!t && !i && !m && !r && !p) return "Stop ✊";
  if (t && !i && !m && !r && !p) return lm[4].y < lm[3].y ? "Like 👍" : "Dislike 👎";
  if (!t && i && m && !r && !p) return "Peace ✌️";
  if (t && !i && !m && !r && p) return "Call 🤙";
  if (!t && i && !m && !r && p) return "Rock 🤘";
  if (t && i && !m && !r && p) return "Love 🤟";

  return "Matching...";
};
  useEffect(() => {
    const interval = setInterval(() => {
      if (!latestLandmarks) return;
      
      const gesture = detectGesture(latestLandmarks);

      if (gesture === lastGesture.current) {
        stableCount.current += 1;
      } else {
        stableCount.current = 0;
        lastGesture.current = gesture;
      }

      if (stableCount.current > 2) setText(gesture);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={s.container}>
      <div style={s.side}>
        <h2 style={{ color: "#64ffda" }}>SignSpeak AI</h2>
        <div style={s.card}>
          <p style={{ fontSize: "0.7rem", color: "#8892b0" }}>PREDICTION</p>
          <h1 style={s.bigText}>{text}</h1>
        </div>
        <div style={s.grid}>
            {["👋 Hello", "✋ Thanks", "✊ Stop", "👍 Like", "👎 Dislike", "☝️ Point", "🔫 Gun", "✌️ Peace", "🤟 Love", "🤙 Call", "🤘 Rock", "👌 Awesome", "✅ Okay", "4️⃣ Four", "3️⃣ Three"].map(sig => (
                <span key={sig}>{sig}</span>
            ))}
        </div>
      </div>
      <div style={s.video}><HandTracking /></div>
    </div>
  );
}

const s = {
  container: { display: "flex", height: "100vh", background: "#020c1b", color: "white", fontFamily: "sans-serif" },
  side: { width: "35%", padding: "20px", borderRight: "1px solid #112240", overflowY: "auto" },
  card: { background: "#112240", padding: "15px", borderRadius: "10px", margin: "15px 0", border: "1px solid #38bdf8", textAlign: "center" },
  bigText: { color: "#38bdf8", fontSize: "2.2rem", margin: "5px 0" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem", color: "#ccd6f6" },
  video: { width: "65%", display: "flex", alignItems: "center", justifyContent: "center" }
};