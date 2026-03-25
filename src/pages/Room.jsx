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

  const [participants, setParticipants] = useState(0);
  const [status, setStatus] = useState("Connecting...");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteName, setRemoteName] = useState("Waiting...");

 useEffect(() => {
  const init = async () => {
    try {
      // 1. Get Media First
      const stream = await getLocalStream(localVideoRef.current);
      
      // 2. Setup Socket Connection
      if (!socket.connected) socket.connect();
      console.log("🟢 Socket connected");

      // 3. Initialize PeerConnection (Listeners ready but no offer yet)
      createPeerConnection(socket, roomId, (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });
      addTracksToPeer(stream);

      // 4. Join the room ONLY after PC and Stream are ready
      socket.emit("join-room", { roomId, name: userName });

      // LISTENERS
      socket.on("your-role", (role) => {
        if (role === "caller") console.log("🎯 I am caller → creating offer");
        socket.emit("get-all-users", { roomId }); // Optional: for participant list
      });

      socket.on("start-offer", async () => {
        // This only fires for the Caller when Callee joins
        await createAndSendOffer(socket, roomId);
        // "📤 Offer sent" is logged inside createAndSendOffer
      });

      socket.on("offer", async (offer) => {
        console.log("📥 Offer received");
        await handleOffer(socket, roomId, offer);
        // "📤 Answer sent" is logged inside handleOffer
      });

      socket.on("answer", async (answer) => {
        console.log("📥 Answer received"); // Perfect Order!
        await handleAnswer(answer);
      });

      socket.on("ice-candidate", async (candidate) => {
        // ICE candidates will start flowing as soon as LocalDescription is set
        await handleIceCandidate(candidate);
      });

    } catch (err) {
      console.error("❌ WebRTC error:", err);
    }
  };

  init();
  
  return () => {
    socket.off("your-role");
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
          <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
          <div style={styles.nameTag}>{remoteName}</div>
        </div>
      </div>
      {status && <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14 }}>{status}</p>}
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
  backButton: { position: "absolute", top: 20, left: 20, fontSize: 18, cursor: "pointer", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "50%" },
  participantBadge: { position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.6)", padding: "8px 14px", borderRadius: 20 },
  grid: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 30 },
  card: { position: "relative", borderRadius: 20, overflow: "hidden", background: "#111" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  nameTag: { position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: 12 },
  controls: { padding: 20, display: "flex", justifyContent: "center", gap: 25 },
  iconBtn: { padding: 18, borderRadius: "50%", border: "none", background: "#1f2937", color: "white", fontSize: "1.3rem", cursor: "pointer" },
};