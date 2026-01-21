import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID");
      return;
    }
    navigate("/call"); // mocked
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Join a Room</h1>

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={styles.input}
      />

      <button style={styles.button} onClick={handleJoin}>
        Join Call
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",          // 🔥 FULL SCREEN FIX
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "24px",
  },

  input: {
    width: "280px",
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #94a3b8",
    marginBottom: "20px",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  button: {
    padding: "12px 30px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#38bdf8",
    color: "#020617",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },
};

export default JoinRoom;
