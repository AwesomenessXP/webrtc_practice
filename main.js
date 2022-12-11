let peerConnection;
let localStream; 
let remoteStream;

// specifies which stun servers to use
let servers = {
  iceServers: [
    {
      urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
    }
  ]
}

let init = async () => {
  // get user's audio and video -> display to the screen
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  // srcObject() sets or returns object that serves as the src of media!!
  document.getElementById('user-1').srcObject = localStream;
}

let createOffer = async () => {
  // connection betw local device and remote peer
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream(); // for the other user
  document.getElementById('user-2').srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    })
  }

  // called each time an ICE candidate is generated 
  // ICE = protocols and routing needed to communicate w/ remote device
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) { // check if it HAS a candidate
      document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);
    }
  }

  // initiates creation of offer for starting new connection
  let offer = await peerConnection.createOffer(); 
  await peerConnection.setLocalDescription(offer);

  document.getElementById('offer-sdp').value = JSON.stringify(offer);
}

init();

document.getElementById('create-offer').addEventListener('click', createOffer);