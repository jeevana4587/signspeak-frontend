import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);

  const [participants, setParticipants] = useState(1);
  const [status, setStatus] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // NEW

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    const init = async () => {
      try {
        await getLocalStream(localVideoRef.current);

        createPeerConnection(socket, roomId, (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        addTracksToPeer();

        socket.emit("join-room", { roomId });

        socket.on("room-users", (count) => {
          setParticipants(count);
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
        console.error(err);
        setStatus("Failed to access camera/microphone");
      }
    };

    init();

    return () => {
      socket.emit("leave-room", { roomId });
      socket.disconnect();
      cleanupWebRTC();
    };
  }, [roomId]);

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
    socketRef.current?.disconnect();
    cleanupWebRTC();
    navigate("/");
  };

  return (
    <div style={styles.page}>

      {/* PARTICIPANT COUNT */}
      <div style={styles.participantBadge}>
        👥 {participants} Participant{participants !== 1 ? "s" : ""}
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div style={styles.settingsPanel}>
          <h4>Settings</h4>

          <div style={styles.settingItem}>
            <span>Microphone</span>
            <button onClick={toggleMic}>
              {micOn ? "Turn Off" : "Turn On"}
            </button>
          </div>

          <div style={styles.settingItem}>
            <span>Camera</span>
            <button onClick={toggleCamera}>
              {camOn ? "Turn Off" : "Turn On"}
            </button>
          </div>

          {/* HELP SECTION */}
          <div style={styles.settingItem}>
            <span>Help</span>
            <button onClick={() => setShowHelp(!showHelp)}>
              {showHelp ? "Hide" : "Show"}
            </button>
          </div>

          {showHelp && (
            <div style={styles.helpBox}>
              <p><strong>Help Guide</strong></p>
              <p>🎤 Click mic to mute/unmute.</p>
              <p>📷 Click camera to turn video on/off.</p>
              <p>📞 Click phone to leave meeting.</p>
              <p>👥 Top right shows participant count.</p>
              <p>⚙️ Use settings to control options.</p>
            </div>
          )}
        </div>
      )}

      {/* VIDEO GRID */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={styles.video}
          />
          <div style={styles.nameTag}>You</div>
        </div>

        <div style={styles.card}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.video}
          />
          <div style={styles.nameTag}>Participant</div>
        </div>
      </div>

      {status && (
        <p style={{ textAlign: "center", color: "#f87171" }}>{status}</p>
      )}

      {/* CONTROLS */}
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

  settingsPanel: {
    position: "absolute",
    top: "70px",
    right: "20px",
    width: "240px",
    background: "#1f2937",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    zIndex: 1000,
  },

  settingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },

  helpBox: {
    marginTop: "10px",
    background: "#111827",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    lineHeight: "1.4",
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
  },
};