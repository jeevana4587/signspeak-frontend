// src/components/LocalVideo.jsx

export default function LocalVideo({ videoRef }) {
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: "300px",
        borderRadius: "10px",
        background: "#000"
      }}
    />
  );
}
