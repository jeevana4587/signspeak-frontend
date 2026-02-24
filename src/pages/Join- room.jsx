import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";

const JoinCall = () => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // 🎥 Camera Preview
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    initCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  const joinRoom = () => {
    if (!roomId || !name) {
      alert("Enter Display Name and Room ID");
      return;
    }

    if (!socket.connected) socket.connect();

    socket.emit("join-room", roomId);
    navigate(`/room/${roomId}`, { state: { name } });
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <h1 style={styles.heading}>
          Ready to <span style={styles.gradientText}>SignSpeak?</span>
        </h1>

        <p style={styles.subtitle}>
          Experience secure, high-quality real-time video communication.
        </p>

        <label style={styles.label}>Display Name</label>
        <input
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={styles.label}>Room ID</label>
        <input
          style={styles.input}
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button style={styles.joinBtn} onClick={joinRoom}>
          Join Meeting →
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <div style={styles.videoCard}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={styles.video}
          />

          <div style={styles.controls}>
            <button onClick={toggleMic} style={styles.iconBtn}>
              {micOn ? "🎤" : "🔇"}
            </button>

            <button onClick={toggleCam} style={styles.iconBtn}>
              {camOn ? "📷" : "🚫"}
            </button>

            <button style={styles.iconBtn}>⚙️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCall;

/* 🎨 STYLES */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "radial-gradient(circle at top left, #1e1b4b, #0f172a)",
    color: "white",
  },
  left: {
    flex: 1,
    padding: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heading: {
    fontSize: "3rem",
    fontWeight: "bold",
  },
  gradientText: {
    background: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    marginTop: "12px",
    marginBottom: "30px",
    opacity: 0.7,
  },
  label: {
    marginTop: "18px",
    fontSize: "0.9rem",
    opacity: 0.7,
  },
  input: {
    marginTop: "6px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none",
  },
  joinBtn: {
    marginTop: "30px",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#7c3aed,#6366f1)",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  videoCard: {
    width: "80%",
    aspectRatio: "16/9",
    background: "#111",
    borderRadius: "24px",
    padding: "10px",
    position: "relative",
    boxShadow: "0 0 40px rgba(124,58,237,0.4)",
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: "20px",
    objectFit: "cover",
  },
  controls: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "20px",
  },
  iconBtn: {
    padding: "14px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer",
    fontSize: "1.2rem",
  },
};