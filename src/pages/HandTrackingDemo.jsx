function HandTrackingDemo() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hand Tracking Demo</h1>

      {/* Camera + Canvas Area */}
      <div style={styles.demoArea}>
        <div style={styles.videoBox}>
          Webcam Feed
        </div>

        <div style={styles.canvasBox}>
          Canvas Overlay
        </div>
      </div>

      {/* Output Section */}
      <div style={styles.outputSection}>
        <p><strong>Detected Landmarks:</strong> —</p>
        <p><strong>Gesture Output (future):</strong> —</p>
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
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "20px",
    fontFamily: "'Times New Roman MT', 'Times New Roman', serif",
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "30px",
  },

  demoArea: {
    display: "flex",
    gap: "30px",
    marginBottom: "30px",
  },

  videoBox: {
    width: "320px",
    height: "240px",
    backgroundColor: "#020617",
    border: "2px solid #38bdf8",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1rem",
  },

  canvasBox: {
    width: "320px",
    height: "240px",
    backgroundColor: "#020617",
    border: "2px dashed #38bdf8",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1rem",
  },

  outputSection: {
    textAlign: "center",
    fontSize: "1.1rem",
  },
};

export default HandTrackingDemo;
