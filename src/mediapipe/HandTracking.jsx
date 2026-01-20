import { useEffect, useRef } from "react";
import { startHandTracking } from "./handTracking";

export function HandTracking(){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      startHandTracking(videoRef.current, canvasRef.current);
    }
  }, [])

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: "100%", background: "black" }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}


