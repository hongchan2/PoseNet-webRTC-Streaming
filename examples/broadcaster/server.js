'use strict';

const { EventEmitter } = require('events');

const broadcaster = new EventEmitter();
const { on } = broadcaster;

function beforeOffer(peerConnection) {
  // 양방향 스트림 생성 - 보내는 쪽이니까 receiver의 트랙을 가져옴?
  // const audioTrack = broadcaster.audioTrack = peerConnection.addTransceiver('audio').receiver.track;
  const videoTrack = broadcaster.videoTrack = peerConnection.addTransceiver('video').receiver.track;

  broadcaster.emit('newBroadcast', {
    // audioTrack,
    videoTrack
  });

  const { close } = peerConnection;
  peerConnection.close = function() {
    // audioTrack.stop()
    videoTrack.stop()
    return close.apply(this, arguments);
  };
}

module.exports = { 
  beforeOffer,
  broadcaster
};
