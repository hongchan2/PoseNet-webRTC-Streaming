'use strict';

var tf = require('@tensorflow/tfjs');
var tmPose = require('@teachablemachine/pose');

const createExample = require('../../lib/browser/example');

const description = 'PoseNet + WebRTC';

const remoteVideo = document.createElement('video');
remoteVideo.autoplay = true;

async function beforeAnswer(peerConnection) {
  const remoteStream = new MediaStream(peerConnection.getReceivers().map(receiver => receiver.track));
  remoteVideo.srcObject = remoteStream;

  // NOTE(mroberts): This is a hack so that we can get a callback when the
  // RTCPeerConnection is closed. In the future, we can subscribe to
  // "connectionstatechange" events.
  const { close } = peerConnection;
  peerConnection.close = function() {
    remoteVideo.srcObject = null;
    return close.apply(this, arguments);
  };

  /*
    DataChannel
  */
}

createExample('viewer', description, { beforeAnswer });

const videos = document.createElement('div');
videos.className = 'grid';
videos.appendChild(remoteVideo);
document.body.appendChild(videos);


/*
  이후로는 동작인식 코드 추가한 부분
  2020.4.21
*/
var button = document.createElement("button");
var aTag = document.createElement("a");
button.innerHTML = "Start Exercise";

var body = document.getElementsByTagName("body")[0];
body.appendChild(button);
body.appendChild(aTag);

button.addEventListener ("click", init);

let model, ctx, maxPredictions, canvas, labelContainer;

async function init() {
  const modelURL = './model';
  const metadataURL = './metadata';
  
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  window.requestAnimationFrame(loop);

  /*
    동영상에 무엇인가를 그리고 싶다면 아래 Canvas 사용
    - index.html 주석도 제거해야 함
  */
  // canvas = document.getElementById("canvas");
  // canvas.width = 500; canvas.height = 500;
  // ctx = canvas.getContext("2d");

  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop(timestamp) {
  await predict();
  setTimeout(window.requestAnimationFrame(loop), 500);
}

let status = "ready"
let count = 0
async function predict() {
  const { pose, posenetOutput } = await model.estimatePose(remoteVideo);
  const prediction = await model.predict(posenetOutput);

  if (prediction[0].probability.toFixed(2)>0.90)
  {
      if(status == "push")
      {
          count++
          // var audio = new Audio(count%10+'.mp3');
          // audio.play();
      }
      status = "ready"
  }
  else if(prediction[1].probability.toFixed(2)>0.90)
  {
      status = "push"
  }
  else if(prediction[2].probability.toFixed(2)>0.90)
  {
      if(status == "push" || status == "ready")
      {
          // var audio = new Audio('bent.mp3');
          // audio.play();
      }
      status = "bent"
  }

  aTag.innerText = " Exercise Count : " + count + " 회";
  for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
          prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  /*
    캔버스 사용 시 관절 좌표 그릴 때 호출
  */
  // drawPose(pose);
}

function drawPose(pose) {
  ctx.drawImage(remoteVideo, 0, 0);
  // draw the keypoints and skeleton
  if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
  }
}


/*
  webRTC DataChannel 추가한 부분
*/


