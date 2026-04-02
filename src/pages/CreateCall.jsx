import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const CreateCall = () => {

const navigate = useNavigate();

const [roomId, setRoomId] = useState("");
const [name, setName] = useState("");

const videoRef = useRef(null);
const streamRef = useRef(null);

useEffect(() => {

/* Generate Room ID */
const newRoomId = Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase();

setRoomId(newRoomId);

/* Start Camera Preview */

const startCamera = async () => {

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

  } catch (err) {
    console.error("Camera error:", err);
  }

};

startCamera();

return () => {
  streamRef.current?.getTracks().forEach(track => track.stop());
};


}, []);

const startCall = () => {

if (!name) {
  alert("Please enter your name");
  return;
}

navigate(`/room/${roomId}`, { state: { name } });

};

const copyRoomId = async () => {
await navigator.clipboard.writeText(roomId);
alert("Room ID copied");
};

return (

<div style={styles.container}>

  {/* BACK BUTTON */}
  <div style={styles.backButton} onClick={() => navigate(-1)}>
    ←
  </div>

  {/* LEFT SIDE */}

  <div style={styles.left}>

    <h1 style={styles.heading}>
      Ready to <span style={styles.gradientText}>SignSpeak?</span>
    </h1>

    <p style={styles.subtitle}>
      Experience secure, high-quality real-time video communication.
    </p>

    <label style={styles.label}>Display Name</label>

    <input
      style={styles.input}
      placeholder="Enter your name"
      value={name}
      onChange={(e)=>setName(e.target.value)}
    />

    <label style={styles.label}>Room ID</label>

    <div style={styles.roomBox}>{roomId}</div>

    <button style={styles.primaryBtn} onClick={startCall}>
      Create Meeting →
    </button>

  </div>

  {/* RIGHT SIDE CAMERA */}

  <div style={styles.right}>

    <div style={styles.videoCard}>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.video}
      />

    </div>

  </div>

</div>

);

};

export default CreateCall;

/* ---------- STYLES ---------- */

const styles = {

container:{
display:"flex",
height:"100vh",
background:"#071a2f",
color:"white",
fontFamily:"sans-serif"
},

backButton:{
position:"absolute",
top:"20px",
left:"20px",
fontSize:"18px",
cursor:"pointer",
color:"white",
background:"rgba(0,0,0,0.5)",
padding:"4px 8px",
borderRadius:"50%"
},

left:{
flex:1,
padding:"90px",
display:"flex",
flexDirection:"column",
justifyContent:"center",
maxWidth:"600px"
},

heading:{
fontSize:"52px",
fontWeight:"700"
},

gradientText:{
background:"linear-gradient(90deg,#4facfe,#00f2fe)",
WebkitBackgroundClip:"text",
WebkitTextFillColor:"transparent"
},

subtitle:{
marginTop:"10px",
marginBottom:"35px",
opacity:0.75
},

label:{
marginTop:"15px",
fontSize:"14px",
opacity:0.7
},

input:{
marginTop:"6px",
padding:"15px",
borderRadius:"12px",
border:"1px solid rgba(255,255,255,0.15)",
background:"rgba(255,255,255,0.05)",
color:"white"
},

roomBox:{
marginTop:"6px",
padding:"15px",
borderRadius:"12px",
border:"1px dashed #334155",
fontSize:"18px",
marginBottom:"20px"
},

primaryBtn:{
marginTop:"20px",
padding:"16px",
borderRadius:"12px",
border:"none",
background:"linear-gradient(90deg,#2196f3,#00bcd4)",
color:"white",
fontSize:"16px",
cursor:"pointer"
},

right:{
flex:1,
display:"flex",
justifyContent:"center",
alignItems:"center"
},

videoCard:{
width:"520px",
height:"320px",
background:"#000",
borderRadius:"24px",
padding:"10px",
boxShadow:"0 0 45px rgba(0,150,255,0.35)"
},

video:{
width:"100%",
height:"100%",
borderRadius:"18px",
objectFit:"cover"
}

};
