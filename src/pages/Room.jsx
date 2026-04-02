import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../services/socket";
import {
  createPeerConnection, getLocalStream, addTracksToPeer,
  createAndSendOffer, handleOffer, handleAnswer,
  handleIceCandidate, cleanupWebRTC,
} from "../services/webrtc";
import HandTracking, { latestLandmarks } from "../mediapipe/HandTracking";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location?.state?.name || "Guest";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [participants, setParticipants] = useState(1);
  const [status, setStatus] = useState(""); // ← EMPTY, no "Connecting..." at start
  const [toast, setToast] = useState("");   // ← NEW: popup message
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteName, setRemoteName] = useState("Waiting...");
  const [gesture, setGesture] = useState("");
  const [showHelp, setShowHelp] = useState(false);

const lastGesture = useRef("");
const stableCount = useRef(0);
  

  // Show a popup toast message for 3 seconds
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await getLocalStream(localVideoRef.current);

        if (!socket.connected) socket.connect();
        // console.log("🟢 Socket connected");

        createPeerConnection(socket, roomId, (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            // showToast("✅ User Connected!");
            setParticipants(2);
          }
        });
        addTracksToPeer(stream);

        socket.emit("join-room", { roomId, name: userName });

        socket.on("your-role", (role) => {
          if (role === "caller") {
            setParticipants(1);
          }
          socket.emit("get-all-users", { roomId });
        });

        socket.on("user-connected", ({ name }) => {
          setRemoteName(name);
          // showToast(`✅ ${name} joined the call!`);
          setParticipants(2);
        });

        socket.on("host-name", ({ name }) => {
          setRemoteName(name);
          // showToast(`✅ Connected with ${name}!`);
          setParticipants(2);
        });

        socket.on("peer-left", () => {
          setRemoteName("Waiting...");
          showToast("❌ User left the call");
          setParticipants(1);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

        socket.on("start-offer", async () => {
          await createAndSendOffer(socket, roomId);
        });

        socket.on("offer", async (offer) => {
          await handleOffer(socket, roomId, offer);
        });

        socket.on("answer", async (answer) => {
          await handleAnswer(answer);
        });

        socket.on("ice-candidate", async (candidate) => {
          await handleIceCandidate(candidate);
        });

        let lastRemoteGesture = "";

socket.on("gesture", ({ name, gesture }) => {

  if (gesture === lastRemoteGesture) return;

  lastRemoteGesture = gesture;

  showToast(`${name}: ${gesture}`);

});

      } catch (err) {
        // console.error("❌ WebRTC error:", err);
        showToast("❌ Error connecting. Please refresh.");
      }
    };

    init();

    return () => {
      socket.off("your-role");
      socket.off("user-connected");
      socket.off("host-name");
      socket.off("peer-left");
      socket.off("start-offer");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      cleanupWebRTC();
    };
  }, [roomId, userName]);

  useEffect(() => {

  const interval = setInterval(() => {

    if (!latestLandmarks) return;

    const g = detectGesture(latestLandmarks);

    if (g === lastGesture.current) {
      stableCount.current++;
    } else {
      stableCount.current = 0;
      lastGesture.current = g;
    }

    if (stableCount.current > 2) {
      setGesture(g);

      socket.emit("gesture", {
        roomId,
        gesture: g,
        name: userName
      });
    }

  }, 120);

  return () => clearInterval(interval);

}, []);

  const toggleMic = () => {
    const stream = localVideoRef.current?.srcObject;
    const track = stream?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject;
    const track = stream?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const leaveCall = () => {
    socket.emit("leave-room", { roomId });
    cleanupWebRTC();
    navigate("/");
  };

 


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

  return (
    <div style={styles.page}>

      {/* TOAST POPUP */}
      {toast !== "" && (
        <div style={styles.toast}>{toast}</div>
      )}

      <div style={styles.backButton} onClick={leaveCall}>←</div>
      <div style={styles.participantBadge}>
        👥 {participants} Participant{participants !== 1 ? "s" : ""}
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <video ref={localVideoRef} autoPlay playsInline muted style={styles.video} />
          <HandTracking videoRef={localVideoRef} />
          <div style={styles.gestureSubtitle}>
    {gesture}
  </div>
          <div style={styles.nameTag}>{userName}</div>
        </div>
        <div style={styles.card}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.video}
            onCanPlay={() => {
              // showToast("✅ User Connected!");
              setParticipants(2);
            }}
          />
          <div style={styles.nameTag}>{remoteName}</div>
        </div>
      </div>

      {/* NO STATUS TEXT SHOWN UNLESS NEEDED */}
      {status !== "" && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14 }}>{status}</p>
      )}

      <div
  style={{
    textAlign: "center",
    fontSize: "22px",
    marginBottom: "10px",
    color: "#38bdf8",
    fontWeight: "bold"
  }}
>
  {gesture}
</div>


      
        

      <div style={styles.controls}>
        <button style={styles.iconBtn} onClick={toggleMic}>{micOn ? "🎤" : "🔇"}</button>
        <button style={styles.iconBtn} onClick={toggleCamera}>{camOn ? "📷" : "🚫"}</button>
        <button style={styles.iconBtn} onClick={() => setShowHelp(true)}>❓</button>
        <button style={{ ...styles.iconBtn, background: "#7f1d1d" }} onClick={leaveCall}>📞</button>
      </div>
    

    {showHelp && (
  <div style={styles.helpOverlay}>
    <div style={styles.helpBox}>

      <h2 style={{marginBottom:20}}>Supported Gestures</h2>

      <div style={styles.helpGrid}>

        <div>👍 Like</div>
        <div>👎 Dislike</div>
        <div>✌️ Peace</div>
        <div>🤙 Call</div>
        <div>🤘 Rock</div>
        <div>🤟 Love</div>
        <div>☝️ Point</div>
        <div>✊ Stop</div>
        <div>👌 Awesome</div>
        <div>3️⃣ Three</div>
        <div>4️⃣ Four</div>
        <div>👋 Hello</div>
        <div>✋ Thank You</div>

      </div>

      <button
        style={styles.closeHelp}
        onClick={() => setShowHelp(false)}
      >
        Close
      </button>

    </div>
  </div>
      )}
    </div>
  );
};


export default Room;

const styles = {
  page: { height: "100vh", width: "100vw", background: "#0b1120", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "white", position: "relative" },
  toast: {
    position: "fixed",
    top: 30,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e293b",
    color: "white",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    zIndex: 999,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    border: "1px solid #334155",
    whiteSpace: "nowrap",
  },
  helpOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
},

helpBox: {
  background: "#111827",
  padding: 30,
  borderRadius: 16,
  width: 400,
  color: "white",
  textAlign: "center"
},

helpGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 20,
  fontSize: 18
},

closeHelp: {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
},
  backButton: { position: "absolute", top: 20, left: 20, fontSize: 18, cursor: "pointer", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "50%" },
  participantBadge: { position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.6)", padding: "8px 14px", borderRadius: 20 },
  grid: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 30 },
  card: { position: "relative", borderRadius: 20, overflow: "hidden", background: "#111" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  nameTag: { position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: 12 },
  controls: { padding: 20, display: "flex", justifyContent: "center", gap: 25 },
  iconBtn: { padding: 18, borderRadius: "50%", border: "none", background: "#1f2937", color: "white", fontSize: "1.3rem", cursor: "pointer" },
};