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
  await peerConnection.setLocalDescription(offer); // signals that local is ready to connect

  document.getElementById('offer-sdp').value = JSON.stringify(offer);
}

let createAnswer = async () => {
  // connection betw local device and remote peer
  peerConnection = new RTCPeerConnection(servers);

  // get devices of the other user
  remoteStream = new MediaStream(); 
  document.getElementById('user-2').srcObject = remoteStream;

  // a media track is an audio or media track in a stream
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
      // converts JS value to JSON string
      document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription);
    }
  }
  
  let offer = document.getElementById('offer-sdp').value;
  if (!offer) return alert('Retrieve offer from peer first...');

  // parse() converts from JSON to string
  offer = JSON.parse(offer);
  await peerConnection.setRemoteDescription(offer); // signals that remote is ready to connect

  let answer = await peerConnection.createAnswer();
  // when fulfilled, calls ICE candidates
  await peerConnection.setLocalDescription(answer); // specifies properties of local end of connection

  // convert answer (in JSON) to string format
  document.getElementById('answer-sdp').value = JSON.stringify(answer);
}

let addAnswer = async () => {
  let answer = document.getElementById('answer-sdp').value;
  if (!answer) return alert('Retrieve answer from peer first...');

  answer = JSON.parse(answer);

  // currentRemoteDescription returns obj describing the remote end of the connection
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
}

init();

document.getElementById('create-offer').addEventListener('click', createOffer);
document.getElementById('create-answer').addEventListener('click', createAnswer);
document.getElementById('add-answer').addEventListener('click', addAnswer);