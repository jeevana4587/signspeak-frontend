// src/services/webrtc.js

let peerConnection = null;
let localStream = null;
let remoteStream = null;

/* -------------------- PEER CONNECTION -------------------- */

export function createPeerConnection(socket, roomId, onRemoteStream) {
  if (peerConnection) return peerConnection;

  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  remoteStream = new MediaStream();

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });

    if (onRemoteStream) {
      onRemoteStream(remoteStream);
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        roomId,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("Peer connection state:", peerConnection.connectionState);
  };

  return peerConnection;
}

/* -------------------- MEDIA -------------------- */

export async function getLocalStream(videoEl) {
  if (
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    throw new Error("Camera/Microphone not supported or insecure context");
  }

  if (localStream) return localStream;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  if (videoEl) {
    videoEl.srcObject = localStream;
    videoEl.muted = true;
    videoEl.playsInline = true;
  }

  return localStream;
}

export function addTracksToPeer() {
  if (!peerConnection || !localStream) return;

  const senders = peerConnection.getSenders();

  localStream.getTracks().forEach((track) => {
    const alreadyAdded = senders.find(
      (sender) => sender.track === track
    );
    if (!alreadyAdded) {
      peerConnection.addTrack(track, localStream);
    }
  });
}

/* -------------------- SIGNALING -------------------- */

export async function createAndSendOffer(socket, roomId) {
  if (!peerConnection) {
    throw new Error("PeerConnection not initialized before creating offer");
  }

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("offer", { roomId, offer });
}

export async function handleOffer(socket, roomId, offer) {
  if (!peerConnection) {
    throw new Error("PeerConnection not initialized before handling offer");
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("answer", { roomId, answer });
}

export async function handleAnswer(answer) {
  if (!peerConnection) return;

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
}

export async function handleIceCandidate(candidate) {
  if (!peerConnection || !candidate) return;

  try {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  } catch (err) {
    console.error("Error adding ICE candidate:", err);
  }
}

/* -------------------- CLEANUP -------------------- */

export function cleanupWebRTC() {
  if (peerConnection) {
    peerConnection.ontrack = null;
    peerConnection.onicecandidate = null;
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  remoteStream = null;
}
