import { useNavigate } from "react-router-dom";

function VideoCall() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Video Call</h1>

      <div style={styles.videoContainer}>
        <div style={styles.videoBox}>Local Video</div>
        <div style={styles.videoBox}>Remote Video</div>
      </div>

      <div style={styles.controls}>
        <button style={styles.controlBtn}>Join</button>
        <button style={styles.controlBtn}>Mute</button>

        {/* 🔥 NEW BUTTON */}
        <button
          style={styles.controlBtn}
          onClick={() => navigate("/hand-demo")}
        >
          Hand Tracking
        </button>

        <button style={styles.leaveBtn}>Leave</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "20px",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
  },

  videoContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
  },

  videoBox: {
    width: "45%",
    height: "300px",
    backgroundColor: "#020617",
    border: "2px solid #38bdf8",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.2rem",
  },

  controls: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  controlBtn: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#38bdf8",
    color: "#020617",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  leaveBtn: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },
};

export default VideoCall;
