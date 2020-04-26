'use strict';

const createExample = require('../../lib/browser/example');

const description = 'PoseNet + WebRTC';

const localVideo = document.createElement('video');
localVideo.autoplay = true;
localVideo.muted = true;

async function beforeAnswer(peerConnection) {
  const localStream = await window.navigator.mediaDevices.getUserMedia({
    video: true
  });

  // ERROR with web view
  // chromium: [INFO:CONSOLE(18)] "Uncaught (in promise) TypeError: peerConnection.addTrack is not a function", source: https://dev.elsiff.me:8443/broadcaster/index.js (18)
  // localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  try {
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    console.log("addTrack()");
  }
  catch(e) {
    try {
      console.log("addTrack() Not Work! - try addStream()");
      peerConnection.addStream(localStream);
      console.log("addStream()");
    }
    catch(e) {
      console.log("addStream() Not Work! - Fetal ERROR");
    }
  }
  
  localVideo.srcObject = localStream;

  // NOTE(mroberts): This is a hack so that we can get a callback when the
  // RTCPeerConnection is closed. In the future, we can subscribe to
  // "connectionstatechange" events.
  const { close } = peerConnection;
  peerConnection.close = function() {
    localVideo.srcObject = null;

    localStream.getTracks().forEach(track => track.stop());

    return close.apply(this, arguments);
  };
}

createExample('broadcaster', description, { beforeAnswer });

const videos = document.createElement('div');
videos.className = 'grid';
videos.appendChild(localVideo);
document.body.appendChild(videos);
