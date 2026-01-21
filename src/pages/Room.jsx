// src/pages/Room.jsx

import useLocalMedia from "../hooks/useLocalMedia";
import LocalVideo from "../components/LocalVideo";

export default function Room() {
  const { videoRef } = useLocalMedia();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Local Video</h2>
      <LocalVideo videoRef={videoRef} />
    </div>
  );
}
