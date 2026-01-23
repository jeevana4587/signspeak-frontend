import { useNavigate } from "react-router-dom";

const CreateCall = () => {
  const navigate = useNavigate();
  const roomId = "ABCD-1234"; // later make this dynamic

  const startCall = () => {
    navigate(`/room/${roomId}`);
  };

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    alert("Room ID copied");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Call</h2>

        <p style={styles.label}>Room ID</p>
        <div style={styles.roomBox}>{roomId}</div>

        <div style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={copyRoomId}>
            Copy Room ID
          </button>

          <button style={styles.primaryBtn} onClick={startCall}>
            Enter Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCall;

/* ---------- styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  card: {
    backgroundColor: "#020617",
    padding: "32px",
    borderRadius: "14px",
    width: "360px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "20px",
    fontSize: "22px",
  },
  label: {
    opacity: 0.7,
    marginBottom: "6px",
  },
  roomBox: {
    fontSize: "20px",
    letterSpacing: "2px",
    fontWeight: "bold",
    backgroundColor: "#020617",
    border: "1px dashed #334155",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primaryBtn: {
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#38bdf8",
    color: "#050505",
  },
  secondaryBtn: {
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #334155",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#fff",
  },
};
