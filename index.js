'use strict';

const bodyParser = require('body-parser');
const browserify = require('browserify-middleware');
const express = require('express');
const http = require('http');
const https = require('https');
const { readdirSync, statSync, readFileSync } = require('fs');
const { join } = require('path');


const { mount } = require('./lib/server/rest/connectionsapi');
const WebRtcConnectionManager = require('./lib/server/connections/webrtcconnectionmanager');

const app = express();

app.use(bodyParser.json());

const examplesDirectory = join(__dirname, 'examples');

const examples = readdirSync(examplesDirectory).filter(path =>
  statSync(join(examplesDirectory, path)).isDirectory());

/*
  클라이언트는 웹으로 보여지게끔 라우터 설정
  서버는 connectionManager로 설정 후 반환

  1. 서버.js로 connectionManager를 만듬
  2. 마운트로 {example}에 맞는 라우터 등록
*/
function setupExample(example) {
  const path = join(examplesDirectory, example);
  const clientPath = join(path, 'client.js');
  const serverPath = join(path, 'server.js');

  app.use(`/${example}/index.js`, browserify(clientPath));
  app.get(`/${example}/index.html`, (req, res) => {
    res.sendFile(join(__dirname, 'html', 'index.html'));
  });

  const options = require(serverPath);
  const connectionManager = WebRtcConnectionManager.create(options);
  mount(app, connectionManager, `/${example}`);

  return connectionManager;
}

app.get('/', (req, res) => res.redirect(`${examples[0]}/index.html`));

// { key : {example}, value : connectionManager(서버 js 정보) }
const connectionManagers = examples.reduce((connectionManagers, example) => {
  const connectionManager = setupExample(example);
  return connectionManagers.set(example, connectionManager);
}, new Map());

let server;
const useHttps = process.env.HTTPS && process.env.HTTPS.toLowerCase() === 'true';
if (useHttps) {
  const options = {
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem'),
  }
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}
server.listen(3000, () => {
  const address = server.address();
  console.log((useHttps ? 'https' : 'http') + `://localhost:${address.port}\n`);

  server.once('close', () => {
    connectionManagers.forEach(connectionManager => connectionManager.close());
  });
});


/*
  모델 다운로드를 위한 설정
*/
var modelJson = require('./my_model/model.json');
var metadataJson = require('./my_model/metadata.json');

app.get('/viewer/model', function(req, res){
  res.send(modelJson);
});

app.get('/viewer/metadata', function(req, res){
  res.send(metadataJson);
});

app.get('/viewer/weights.bin', function(req, res){
  const file = './my_model/weights.bin';
  res.download(file);
});
