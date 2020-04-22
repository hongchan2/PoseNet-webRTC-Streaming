/*
  1. GET /connections -> connection(id, connection)을 찾아서 전송
  2. POST /connections -> connection 새로 만들어 전송
  3. DELETE /connections/:id -> connection 찾아서 삭제후 전송
  4. GET /connections/:id -> connection 찾아서 전송
*/

'use strict';

function mount(app, connectionManager, prefix = '') {
  app.get(`${prefix}/connections`, (req, res) => {
    res.send(connectionManager.getConnections());
  });

  app.post(`${prefix}/connections`, async (req, res) => {
    try {
      const connection = await connectionManager.createConnection();
      res.send(connection);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  app.delete(`${prefix}/connections/:id`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    connection.close();
    res.send(connection);
  });

  app.get(`${prefix}/connections/:id`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    res.send(connection);
  });

  app.get(`${prefix}/connections/:id/local-description`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    res.send(connection.toJSON().localDescription);
  });

  app.get(`${prefix}/connections/:id/remote-description`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    res.send(connection.toJSON().remoteDescription);
  });

  app.post(`${prefix}/connections/:id/remote-description`, async (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    try {
      await connection.applyAnswer(req.body);
      res.send(connection.toJSON().remoteDescription);
    } catch (error) {
      res.sendStatus(400);
    }
  });
}

function connectionsApi(app, connectionManager) {
  mount(app, connectionManager, '/v1');
}

module.exports = connectionsApi;
module.exports.mount = mount;
