import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";

const JoinCall = () => {

const [roomId, setRoomId] = useState("");
const [name, setName] = useState("");
const [micOn, setMicOn] = useState(true);
const [camOn, setCamOn] = useState(true);

const [showSettings, setShowSettings] = useState(false);
const [showHelp, setShowHelp] = useState(false);

const videoRef = useRef(null);
const streamRef = useRef(null);
const navigate = useNavigate();

/* CAMERA PREVIEW */

useEffect(()=>{

const initCamera = async()=>{

try{

const stream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
});

streamRef.current = stream;
videoRef.current.srcObject = stream;

}catch(err){

console.error("Camera error:",err);

}

};

initCamera();

return ()=>{
streamRef.current?.getTracks().forEach(track=>track.stop());
};

},[]);

/* MIC TOGGLE */

const toggleMic = ()=>{

const track = streamRef.current?.getAudioTracks()[0];

if(track){
track.enabled = !track.enabled;
setMicOn(track.enabled);
}

};

/* CAMERA TOGGLE */

const toggleCam = ()=>{

const track = streamRef.current?.getVideoTracks()[0];

if(track){
track.enabled = !track.enabled;
setCamOn(track.enabled);
}

};

/* JOIN ROOM */

const joinRoom = ()=>{

if(!roomId || !name){
alert("Enter Display Name and Room ID");
return;
}

if(!socket.connected) socket.connect();

socket.emit("join-room", {
  roomId: roomId,
  name: name
});


navigate(`/room/${roomId}`,{state:{name}});

};

return(

<div style={styles.container}>

{/* BACK BUTTON */}

<div style={styles.backButton} onClick={()=>navigate(-1)}>
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

<input
style={styles.input}
placeholder="Enter room ID"
value={roomId}
onChange={(e)=>setRoomId(e.target.value)}
/>

<button style={styles.joinBtn} onClick={joinRoom}>
Join Meeting →
</button>

</div>

{/* RIGHT SIDE */}

<div style={styles.right}>

<div style={styles.videoCard}>

<video
ref={videoRef}
autoPlay
playsInline
muted
style={styles.video}
/>

{/* CONTROLS */}

<div style={styles.controls}>

<button onClick={toggleMic} style={styles.iconBtn}>
{micOn ? "🎤" : "🔇"}
</button>

<button onClick={toggleCam} style={styles.iconBtn}>
{camOn ? "📷" : "🚫"}
</button>

<button
onClick={()=>setShowSettings(!showSettings)}
style={styles.iconBtn}
>
⚙
</button>

</div>

{/* SETTINGS MENU */}

{showSettings && (

<div style={styles.settingsPanel}>

<h3 style={{marginBottom:"10px"}}>Settings</h3>

<button style={styles.settingBtn} onClick={toggleMic}>
{micOn ? "Mute Mic" : "Unmute Mic"}
</button>

<button style={styles.settingBtn} onClick={toggleCam}>
{camOn ? "Turn Off Camera" : "Turn On Camera"}
</button>

<button
style={styles.settingBtn}
onClick={()=>setShowHelp(!showHelp)}
>
Help
</button>

<button
style={styles.closeBtn}
onClick={()=>setShowSettings(false)}
>
Close
</button>

</div>

)}

{/* HELP PANEL */}

{showHelp && (

<div style={styles.helpPanel}>

<h3>Help</h3>

<p>1. Enter your Display Name.</p>
<p>2. Enter the Room ID.</p>
<p>3. Turn camera or mic on if needed.</p>
<p>4. Click Join Meeting.</p>

<button
style={styles.closeBtn}
onClick={()=>setShowHelp(false)}
>
Close
</button>

</div>

)}

</div>

</div>

</div>

);

};

export default JoinCall;

/* ---------- STYLES ---------- */

const styles = {

container:{
display:"flex",
height:"100vh",
background:"#071a2f",
color:"white",
fontFamily:"sans-serif",
position:"relative"
},

backButton:{
position:"absolute",
top:"20px",
left:"20px",
fontSize:"20px",
cursor:"pointer",
color:"white",
background:"rgba(0,0,0,0.5)",
padding:"4px 8px",
borderRadius:"50%",
zIndex:1000
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

joinBtn:{
marginTop:"30px",
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
position:"relative",
boxShadow:"0 0 45px rgba(0,150,255,0.35)"
},

video:{
width:"100%",
height:"100%",
borderRadius:"18px",
objectFit:"cover"
},

controls:{
position:"absolute",
bottom:"18px",
left:"50%",
transform:"translateX(-50%)",
display:"flex",
gap:"18px"
},

iconBtn:{
width:"46px",
height:"46px",
borderRadius:"50%",
border:"none",
background:"rgba(255,255,255,0.12)",
color:"white",
cursor:"pointer",
fontSize:"18px"
},

settingsPanel:{
position:"absolute",
top:"20px",
right:"20px",
background:"#0b2a45",
padding:"18px",
borderRadius:"12px",
boxShadow:"0 0 25px rgba(0,150,255,0.4)",
display:"flex",
flexDirection:"column",
gap:"10px",
width:"200px"
},

helpPanel:{
position:"absolute",
top:"20px",
right:"240px",
background:"#0b2a45",
padding:"18px",
borderRadius:"12px",
boxShadow:"0 0 25px rgba(0,150,255,0.4)",
width:"220px"
},

settingBtn:{
padding:"10px",
border:"none",
borderRadius:"6px",
background:"#1e90ff",
color:"white",
cursor:"pointer"
},

closeBtn:{
marginTop:"8px",
padding:"8px",
border:"none",
borderRadius:"6px",
background:"#ff4d4d",
color:"white",
cursor:"pointer"
}

};