'use strict';

const protocol = require('pomelo-protocol');
const Package = protocol.Package;
const logger = require('pomelo-logger').getLogger('pomelo', __filename);

const handlers = {};

const ST_INITED = 0;
const ST_WAIT_ACK = 1;
const ST_WORKING = 2;

function _handleHandshake(socket, pkg) {
  if (socket.state !== ST_INITED) {
    return;
  }

  try {
    socket.emit('handshake', JSON.parse(protocol.strdecode(pkg.body)));
  } catch (ex) {
    socket.emit('handshake', {});
  }
}

function _handleHandshakeAck(socket, pkg) {
  if (socket.state !== ST_WAIT_ACK) {
    return;
  }
  socket.state = ST_WORKING;
  socket.emit('heartbeat');
}

function _handleHeartbeat(socket, pkg) {
  if (socket.state !== ST_WORKING) {
    return;
  }

  socket.emit('heartbeat');
}

function _handleData(socket, pkg) {
  if (socket.state !== ST_WORKING) {
    return;
  }
  socket.emit('message', pkg);
}

handlers[Package.TYPE_HANDSHAKE] = _handleHandshake;
handlers[Package.TYPE_HANDSHAKE_ACK] = _handleHandshakeAck;
handlers[Package.TYPE_HEARTBEAT] = _handleHeartbeat;
handlers[Package.TYPE_DATA] = _handleData;

function handle(socket, pkg) {
  const handler = handlers[pkg.type];
  if (handler) {
    handler(socket, pkg);
  } else {
    logger.error('could not find handle invalid data package.');
    socket.disconnect();
  }
}

module.exports = handle;
