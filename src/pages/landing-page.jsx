import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SignSpeak</h1>

      <p style={styles.subtitle}>
        Real-Time Sign Language to Text Translation in Video Calls
      </p>

      <div style={styles.buttonGroup}>
        <button style={styles.primaryBtn} onClick={() => navigate("/join")}>
          Join Room
        </button>

        <button
          style={styles.secondaryBtn}
          onClick={() => navigate("/hand-demo")}
        >
          Hand Tracking Demo
        </button>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",   // ✅ simple solid background
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  title: {
    fontSize: "3.4rem",
    fontWeight: "bold",
    letterSpacing: "1px",
    marginBottom: "12px",
  },

  subtitle: {
    fontSize: "1.2rem",
    maxWidth: "500px",
    marginBottom: "40px",
    color: "#cbd5f5",
  },

  buttonGroup: {
    display: "flex",
    gap: "20px",
  },

  primaryBtn: {
    padding: "12px 28px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#38bdf8",
    color: "#020617",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  secondaryBtn: {
    padding: "12px 28px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #38bdf8",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#38bdf8",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },
};

export default LandingPage;
