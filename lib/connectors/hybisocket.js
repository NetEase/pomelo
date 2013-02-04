var util = require('util');
var EventEmitter = require('events').EventEmitter;
var protocol = require('pomelo-protocol');

var ST_INITED = 0;
var ST_WAIT_ACK = 1;
var ST_WORKING = 2;
var ST_CLOSED = 3;

/**
 * Package types
 */
var PKG_HANDSHAKE = 1;    // handshake package
var PKG_HANDSHAKE_ACK = 2;    // handshake ack package
var PKG_HEARTBEAT = 3;    // heartbeat package
var PKG_DATA = 4;         // data package

/**
 * Socket class that wraps socket and websocket to provide unified interface for up level.
 */
var Socket = function(id, socket) {
  EventEmitter.call(this);
  this.id = id;
  this.socket = socket;
  this.remoteAddress = {
    ip: socket._socket.remoteAddress,
    port: socket._socket.remotePort
  };

  var self = this;

  socket.on('close', this.emit.bind(this, 'disconnect'));
  socket.on('error', this.emit.bind(this, 'error'));

  socket.on('message', function(msg) {
    if(msg) {
      msg = protocol.decode(msg);
      handle(self, msg);
    }
  });

  this.state = ST_INITED;

  // TODO: any other events?
};

util.inherits(Socket, EventEmitter);

module.exports = Socket;

/**
 * Send raw byte data.
 *
 * @api private
 */
Socket.prototype.sendRaw = function(msg) {
  if(this.state !== ST_WORKING) {
    return;
  }

  this.socket.send(msg, {binary: true});
};

/**
 * Send byte data package to client.
 *
 * @param  {Buffer} msg byte data
 */
Socket.prototype.send = function(msg) {
  if(typeof msg !== 'string'){
    msg = JSON.stringify(msg);
  }

  this.sendRaw(protocol.encode(PKG_DATA, protocol.strencode(msg)));
};

Socket.prototype.sendBatch = function(msgs) {
  for(var key in msgs) {
    this.send(msgs[key]);
  }
};

/**
 * Send message to client no matter whether handshake.
 *
 * @api private
 */
Socket.prototype.sendForce = function(msg) {
  if(this.state === ST_CLOSED) {
    return;
  }
  this.socket.send(msg, {binary: true});
};

/**
 * Response handshake request
 *
 * @api private
 */
Socket.prototype.handshakeResponse = function(resp) {
  if(this.state !== ST_INITED) {
    return;
  }
  this.socket.send(resp, {binary: true});
  this.state = ST_WAIT_ACK;
};

Socket.prototype.disconnect = function() {
  if(this.state === ST_CLOSED) {
    return;
  }

  this.state = ST_CLOSED;
  this.socket.close();
};

var handle = function(socket, msg) {
 var handler = handlers[msg.flag];
 if(handler) {
  handler(socket, msg);
 }
};

var handleHandshake = function(socket, msg) {
  socket.emit('handshake', msg.buffer.toString('utf8'));
};

var handleHandshakeAck = function(socket, msg) {
  socket.state = ST_WORKING;
  socket.emit('heartbeat');
};

var handleHeartbeat = function(socket, msg) {
  socket.emit('heartbeat');
};

var handleData = function(socket, msg) {
  msg = protocol.body.decode(msg.buffer);
  msg.route = protocol.strdecode(msg.route);
  msg.body = protocol.strdecode(msg.buffer);
  socket.emit('message', msg);
};

var handlers = {};
handlers[PKG_HANDSHAKE] = handleHandshake;
handlers[PKG_HANDSHAKE_ACK] = handleHandshakeAck;
handlers[PKG_HEARTBEAT] = handleHeartbeat;
handlers[PKG_DATA] = handleData;
