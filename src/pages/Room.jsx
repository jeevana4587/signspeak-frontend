import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../services/socket";

const Room = () => {
  const { roomId } = useParams();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) return;

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        socket.connect();
        socket.emit("join-room", { roomId });

        socket.on("user-joined", () => {
          setParticipants(p => p + 1);
        });
      } catch (e) {
        console.error("Camera error:", e);
      }
    };

    start();

    return () => {
      mounted = false;
      socket.off("user-joined");
      socket.disconnect();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [roomId]);

  return (
    <div style={styles.page}>
      {/* VIDEO */}
      <div style={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />
      </div>

      {/* INFO */}
      <div style={styles.info}>
        <p><strong>Room ID:</strong> {roomId}</p>
        <p>Participants: {participants}</p>
        {participants === 1 && (
          <p style={{ opacity: 0.7 }}>Waiting for someone to join…</p>
        )}
      </div>
    </div>
  );
};

export default Room;

/* ---------- styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0f172a",
    color: "#fff",
    paddingTop: "40px",
  },
  videoWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  video: {
    width: "60vw",          // ✅ 60% of screen width
    aspectRatio: "16 / 9",  // ✅ proper video height
    background: "#000",
    borderRadius: "14px",
  },
  info: {
    textAlign: "center",
    marginTop: "24px",
  },
};
