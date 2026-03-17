import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../services/socket";

import {
createPeerConnection,
getLocalStream,
addTracksToPeer,
createAndSendOffer,
handleOffer,
handleAnswer,
handleIceCandidate,
cleanupWebRTC,
} from "../services/webrtc";

const Room = () => {

const { roomId } = useParams();
const navigate = useNavigate();
const location = useLocation();

const userName = location?.state?.name || "Guest";

const localVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
const socketRef = useRef(null);

const [participants, setParticipants] = useState(1);
const [status, setStatus] = useState("");
const [micOn, setMicOn] = useState(true);
const [camOn, setCamOn] = useState(true);
const [showSettings, setShowSettings] = useState(false);
const [showHelp, setShowHelp] = useState(false);
const [remoteName, setRemoteName] = useState("Participant");

useEffect(() => {

socketRef.current = socket;

if (!socket.connected) {
  socket.connect();
}

const init = async () => {

  try {

    let stream;

    if (localVideoRef.current) {
      stream = await getLocalStream(localVideoRef.current);
    }

    createPeerConnection(socket, roomId, (remoteStream) => {
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    if (stream) {
      addTracksToPeer(stream);
    }

    socket.emit("join-room", {
      roomId: roomId,
      name: userName
    });

    socket.on("room-users", (count) => {
      setParticipants(count);
    });

    socket.on("peer-name", (name) => {
      setRemoteName(name);
    });

    socket.on("peer-joined", async () => {
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

    socket.on("peer-left", () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

  } catch (err) {
    console.error("WebRTC error:", err);
    setStatus("Failed to access camera/microphone");
  }

};

init();

return () => {

  if (socketRef.current) {
    socketRef.current.emit("leave-room", { roomId });
  }

  cleanupWebRTC();

};

}, [roomId, userName]);

const toggleMic = () => {

const stream = localVideoRef.current?.srcObject;
if (!stream) return;

const track = stream.getAudioTracks()[0];

if (track) {
  track.enabled = !track.enabled;
  setMicOn(track.enabled);
}

};

const toggleCamera = () => {

const stream = localVideoRef.current?.srcObject;
if (!stream) return;

const track = stream.getVideoTracks()[0];

if (track) {
  track.enabled = !track.enabled;
  setCamOn(track.enabled);
}

};

const leaveCall = () => {

socketRef.current?.emit("leave-room", { roomId });

cleanupWebRTC();

navigate("/");

};

return (

<div style={styles.page}>

  <div style={styles.backButton} onClick={leaveCall}>
    ←
  </div>

  <div style={styles.participantBadge}>
    👥 {participants} Participant{participants !== 1 ? "s" : ""}
  </div>

  <div style={styles.grid}>

    <div style={styles.card}>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={styles.video}
      />
      <div style={styles.nameTag}>{userName}</div>
    </div>

    <div style={styles.card}>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={styles.video}
      />
      <div style={styles.nameTag}>{remoteName}</div>
    </div>

  </div>

  {status && (
    <p style={{ textAlign: "center", color: "#f87171" }}>{status}</p>
  )}

  <div style={styles.controls}>

    <button style={styles.iconBtn} onClick={toggleMic}>
      {micOn ? "🎤" : "🔇"}
    </button>

    <button style={styles.iconBtn} onClick={toggleCamera}>
      {camOn ? "📷" : "🚫"}
    </button>

    <button style={styles.iconBtn} onClick={leaveCall}>
      📞
    </button>

    <button
      style={styles.iconBtn}
      onClick={() => setShowSettings(!showSettings)}
    >
      ⚙️
    </button>

  </div>

</div>

);

};

export default Room;

const styles = {

page: {
height: "100vh",
width: "100vw",
background: "#0b1120",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
overflow: "hidden",
color: "white",
position: "relative",
},

backButton: {
position: "absolute",
top: "20px",
left: "20px",
fontSize: "18px",
cursor: "pointer",
color: "white",
zIndex: 1000,
background: "rgba(0,0,0,0.5)",
padding: "4px 8px",
borderRadius: "50%"
},

participantBadge: {
position: "absolute",
top: "20px",
right: "20px",
background: "rgba(0,0,0,0.6)",
padding: "8px 14px",
borderRadius: "20px",
fontSize: "0.9rem",
zIndex: 1000,
},

grid: {
flex: 1,
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "20px",
padding: "30px",
},

card: {
position: "relative",
borderRadius: "20px",
overflow: "hidden",
background: "#111",
},

video: {
width: "100%",
height: "100%",
objectFit: "cover",
},

nameTag: {
position: "absolute",
bottom: "10px",
left: "10px",
background: "rgba(0,0,0,0.6)",
padding: "6px 12px",
borderRadius: "12px",
fontSize: "0.9rem",
},

controls: {
padding: "20px",
display: "flex",
justifyContent: "center",
gap: "25px",
},

iconBtn: {
padding: "18px",
borderRadius: "50%",
border: "none",
background: "#1f2937",
color: "white",
fontSize: "1.3rem",
cursor: "pointer",
}

};