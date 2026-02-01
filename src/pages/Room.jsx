import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [participants, setParticipants] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    const initRoom = async () => {
      try {
        // 1️⃣ Get local camera + mic
        await getLocalStream(localVideoRef.current);

        if (!mounted) return;

        // 2️⃣ Setup PeerConnection
        createPeerConnection(socket, roomId, (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        });

        addTracksToPeer();

        // 3️⃣ Connect socket
        socket.connect();
        socket.emit("join-room", { roomId });

        // 4️⃣ Socket events
        socket.on("peer-joined", async () => {
          console.log("Peer joined!");
          setParticipants(2);
          setStatus("");
          await createAndSendOffer(socket, roomId);
        });

        socket.on("offer", async (offer) => {
          console.log("Offer received", offer);
          await handleOffer(socket, roomId, offer);
        });

        socket.on("answer", async (answer) => {
           console.log("Answer received", answer);
          await handleAnswer(answer);
        });

        socket.on("ice-candidate", async (candidate) => {
          console.log("ICE candidate", candidate);
          await handleIceCandidate(candidate);
        });

        socket.on("peer-left", () => {
          setParticipants(1);
          setStatus("The other user left the call");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });
      } catch (err) {
        console.error("Room init error:", err);
        setStatus("Failed to access camera/microphone");
      }
    };

    initRoom();

    return () => {
      mounted = false;
      cleanupRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const cleanupRoom = (emitLeave = true) => {
    if (emitLeave) socket.emit("leave-room", { roomId });

    // Remove all socket listeners for this room
    socket.off("peer-joined");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("peer-left");

    // Stop all media + close peer
    cleanupWebRTC();

    // Disconnect socket safely
    socket.disconnect();
  };

  const leaveCall = () => {
    cleanupRoom(true);
    navigate("/");
  };

  return (
    <div style={styles.page}>
      {/* VIDEOS */}
      <div style={styles.videoWrapper}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={styles.video}
        />
      </div>

      {/* INFO */}
      <div style={styles.info}>
        <p><strong>Room ID:</strong> {roomId}</p>
        <p>Participants: {participants}</p>

        {participants === 1 && !status && (
          <p style={{ opacity: 0.7 }}>Waiting for someone to join…</p>
        )}

        {status && <p style={{ color: "#f87171", marginTop: "8px" }}>{status}</p>}

        <button onClick={leaveCall} style={styles.leaveBtn}>
          Leave Call
        </button>
      </div>
    </div>
  );
};

export default Room;

/* ---------- STYLES ---------- */
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
    gap: "12px",
    flexWrap: "wrap",
  },
  video: {
    width: "45vw",
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: "14px",
  },
  info: {
    textAlign: "center",
    marginTop: "24px",
  },
  leaveBtn: {
    marginTop: "20px",
    padding: "12px 20px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
};