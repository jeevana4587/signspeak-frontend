let peerConnection = null;
let localStream = null;

const ICE_SERVERS = {
  iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:asia.relay.metered.ca:80",
        username: "10491e2c727491ac5aea01de",
        credential: "MDPGRWpx9KjeSvZ7",
      },
      {
        urls: "turn:asia.relay.metered.ca:80?transport=tcp",
        username: "10491e2c727491ac5aea01de",
        credential: "MDPGRWpx9KjeSvZ7",
      },
      {
        urls: "turn:asia.relay.metered.ca:443",
        username: "10491e2c727491ac5aea01de",
        credential: "MDPGRWpx9KjeSvZ7",
      },
      {
        urls: "turns:asia.relay.metered.ca:443?transport=tcp",
        username: "10491e2c727491ac5aea01de",
        credential: "MDPGRWpx9KjeSvZ7",
      },
  ],
};

export function createPeerConnection(socket, roomId, onRemoteStream) {
  // Always clean up before creating a new one
  console.log("🚀 createPeerConnection CALLED");
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.ontrack = (event) => {
    console.log("🎥 Remote track received:", event.streams);
    if (onRemoteStream && event.streams[0]) {
      onRemoteStream(event.streams[0]);
    }
  };

  peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    console.log("🧊 ICE Candidate:", event.candidate);

    socket.emit("ice-candidate", {
      roomId,
      candidate: event.candidate,
    });
  } else {
    console.log("❄️ ICE Gathering Complete");
  }
};

  peerConnection.oniceconnectionstatechange = () => {
    console.log("🧊 ICE state:", peerConnection?.iceConnectionState);
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("🔗 Connection state:", peerConnection?.connectionState);
  };

  peerConnection.onnegotiationneeded = () => {
    console.log("🔄 Negotiation needed");
  };

  return peerConnection;
}

export async function getLocalStream(videoEl) {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });
  }
  if (videoEl) {
    videoEl.srcObject = localStream;
  }
  return localStream;
}

export function addTracksToPeer(stream) {
  if (!peerConnection || !stream) return;
  stream.getTracks().forEach((track) => {
    console.log("✅ Adding track:", track.kind);
    peerConnection.addTrack(track, stream);
  });
}

export async function createAndSendOffer(socket, roomId) {
  if (!peerConnection) return;
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("📤 Offer sent");
    socket.emit("offer", { roomId, offer });
  } catch (err) {
    console.error("❌ Error creating offer:", err);
  }
}

export async function handleOffer(socket, roomId, offer) {
  if (!peerConnection) return;
  
  // Guard: If we are already in the middle of a handshake, don't accept another offer
  if (peerConnection.signalingState !== "stable") {
    console.warn("⚠️ Received offer but signaling state is not stable. Ignoring.");
    return;
  }

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("📤 Answer sent");
    socket.emit("answer", { roomId, answer });
  } catch (err) {
    console.error("❌ Error handling offer:", err);
  }
}

export async function handleAnswer(answer) {
  if (!peerConnection) return;
  
  // Guard: Only process an answer if we are actually waiting for one (have-local-offer)
  if (peerConnection.signalingState === "have-local-offer") {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("❌ Error handling answer:", err);
    }
  } else {
    console.warn("⚠️ Received answer but we are in state:", peerConnection.signalingState);
  }
}

export async function handleIceCandidate(candidate) {
  if (!peerConnection || !candidate) return;
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.error("❌ ICE error:", err);
  }
}

export function cleanupWebRTC() {
  if (peerConnection) {
    peerConnection.ontrack = null;
    peerConnection.onicecandidate = null;
    peerConnection.onconnectionstatechange = null;
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
}