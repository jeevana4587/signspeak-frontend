import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../services/socket";
import {
  createPeerConnection, getLocalStream, addTracksToPeer,
  createAndSendOffer, handleOffer, handleAnswer,
  handleIceCandidate, cleanupWebRTC,
} from "../services/webrtc";

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

  // Show a popup toast message for 3 seconds
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await getLocalStream(localVideoRef.current);

        if (!socket.connected) socket.connect();
        console.log("🟢 Socket connected");

        createPeerConnection(socket, roomId, (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            showToast("✅ User Connected!");
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
          showToast(`✅ ${name} joined the call!`);
          setParticipants(2);
        });

        socket.on("host-name", ({ name }) => {
          setRemoteName(name);
          showToast(`✅ Connected with ${name}!`);
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

      } catch (err) {
        console.error("❌ WebRTC error:", err);
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
          <div style={styles.nameTag}>{userName}</div>
        </div>
        <div style={styles.card}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.video}
            onCanPlay={() => {
              showToast("✅ User Connected!");
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

      <div style={styles.controls}>
        <button style={styles.iconBtn} onClick={toggleMic}>{micOn ? "🎤" : "🔇"}</button>
        <button style={styles.iconBtn} onClick={toggleCamera}>{camOn ? "📷" : "🚫"}</button>
        <button style={{ ...styles.iconBtn, background: "#7f1d1d" }} onClick={leaveCall}>📞</button>
      </div>
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
  backButton: { position: "absolute", top: 20, left: 20, fontSize: 18, cursor: "pointer", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "50%" },
  participantBadge: { position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.6)", padding: "8px 14px", borderRadius: 20 },
  grid: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 30 },
  card: { position: "relative", borderRadius: 20, overflow: "hidden", background: "#111" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  nameTag: { position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: 12 },
  controls: { padding: 20, display: "flex", justifyContent: "center", gap: 25 },
  iconBtn: { padding: 18, borderRadius: "50%", border: "none", background: "#1f2937", color: "white", fontSize: "1.3rem", cursor: "pointer" },
};