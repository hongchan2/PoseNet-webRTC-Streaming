'use strict';

const { EventEmitter } = require('events');

const broadcaster = new EventEmitter();
const { on } = broadcaster;

function beforeOffer(peerConnection) {
  // 양방향 스트림 생성 - 보내는 쪽이니까 receiver의 트랙을 가져옴?
  const videoTrack = broadcaster.videoTrack = peerConnection.addTransceiver('video').receiver.track;

  broadcaster.emit('newBroadcast', {
    videoTrack
  });

  const { close } = peerConnection;
  peerConnection.close = function() {
    videoTrack.stop()
    return close.apply(this, arguments);
  };
}

module.exports = { 
  beforeOffer,
  broadcaster
};
