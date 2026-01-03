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
        <button style={styles.button} onClick={() => navigate("/join")}>
          Join Room
        </button>

        <button
          style={styles.secondaryButton}
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
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    textAlign: "center",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
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
  button: {
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#38bdf8",
    color: "#0f172a",
  },
  secondaryButton: {
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #38bdf8",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#38bdf8",
  },
};

export default LandingPage;
v