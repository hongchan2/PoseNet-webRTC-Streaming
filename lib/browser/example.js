'use strict';

const createStartStopButton = require('./startstopbutton');
const ConnectionClient = require('../client');

function createExample(name, description, options) {
  const nameTag = document.createElement('h2');
  nameTag.innerText = name;
  document.body.appendChild(nameTag);

  const descriptionTag = document.createElement('p');
  descriptionTag.innerHTML = description;
  document.body.appendChild(descriptionTag);

  const clickStartTag = document.createElement('p');
  clickStartTag.innerHTML = 'Click &ldquo;Start&rdquo; to begin.';
  document.body.appendChild(clickStartTag);

  const connectionClient = new ConnectionClient();

  let peerConnection = null;

  /*
    start: Connection 생성 (서버와 통신)
    stop:  Connection close (서버와 통신)
  */
  createStartStopButton(async () => {
    peerConnection = await connectionClient.createConnection(options);
    window.peerConnection = peerConnection;
  }, () => {
    peerConnection.close();
  });
}

module.exports = createExample;
