'use strict';

const { broadcaster } = require('../broadcaster/server')

function beforeOffer(peerConnection) {
  const videoTransceiver = peerConnection.addTransceiver('video');
  
  function onNewBroadcast({ videoTrack }) {
    videoTransceiver.sender.replaceTrack(videoTrack) 
  }

  broadcaster.on('newBroadcast', onNewBroadcast)

  if (broadcaster.videoTrack) {
    onNewBroadcast(broadcaster);
  }

  const { close } = peerConnection;
  peerConnection.close = function() {
    broadcaster.removeListener('newBroadcast', onNewBroadcast);
    return close.apply(this, arguments);
  }
}

module.exports = { beforeOffer };
