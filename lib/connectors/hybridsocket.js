var util = require('util');
var EventEmitter = require('events').EventEmitter;
var protocol = require('pomelo-protocol');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var Package = protocol.Package;

var ST_INITED = 0;
var ST_WAIT_ACK = 1;
var ST_WORKING = 2;
var ST_CLOSED = 3;

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

  socket.once('close', this.emit.bind(this, 'disconnect'));
  socket.on('error', this.emit.bind(this, 'error'));

  socket.on('message', function(msg) {
    if(msg) {
      msg = Package.decode(msg);
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
  var self = this;

  this.socket.send(msg, {binary: true}, function(err) {
    if(!!err) {
      logger.error('websocket([%s]:[%s]) send binary data failed: %j', self.socket._socket.remoteAddress, self.socket._socket.remotePort, err);
      return;
    }
  });
};

/**
 * Send byte data package to client.
 *
 * @param  {Buffer} msg byte data
 */
Socket.prototype.send = function(msg) {
  if(msg instanceof String) {
    msg = new Buffer(msg);
  } else if(!(msg instanceof Buffer)) {
    msg = new Buffer(JSON.stringify(msg));
  }
  this.sendRaw(Package.encode(Package.TYPE_DATA, msg));
};

/**
 * Send byte data packages to client in batch.
 *
 * @param  {Buffer} msgs byte data
 */
Socket.prototype.sendBatch = function(msgs) {
  var rs = [];
  for(var i=0; i<msgs.length; i++) {
    var src = Package.encode(Package.TYPE_DATA, msgs[i]);
    rs.push(src);
  }
  this.sendRaw(Buffer.concat(rs));
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

/**
 * Close the connection.
 *
 * @api private
 */
Socket.prototype.disconnect = function() {
  if(this.state === ST_CLOSED) {
    return;
  }

  this.state = ST_CLOSED;
  this.socket.emit('close');
  this.socket.close();
};

var handle = function(socket, msg) {
  var handler = handlers[msg.type];
  if(handler) {
    handler(socket, msg);
  }
  else {
    logger.error('could not find handle invalid data package.');
    socket.disconnect();
  }
};

var handleHandshake = function(socket, msg) {
  if(socket.state !== ST_INITED) {
    return;
  }

  socket.emit('handshake', JSON.parse(protocol.strdecode(msg.body)));
};

var handleHandshakeAck = function(socket) {
  if(socket.state !== ST_WAIT_ACK) {
    return;
  }

  socket.state = ST_WORKING;
  socket.emit('heartbeat');
};

var handleHeartbeat = function(socket) {
  if(socket.state !== ST_WORKING) {
    return;
  }
  socket.emit('heartbeat');
};

var handleData = function(socket, msg) {
  if(socket.state !== ST_WORKING) {
    return;
  }

  socket.emit('message', msg);
};

var handlers = {};
handlers[Package.TYPE_HANDSHAKE] = handleHandshake;
handlers[Package.TYPE_HANDSHAKE_ACK] = handleHandshakeAck;
handlers[Package.TYPE_HEARTBEAT] = handleHeartbeat;
handlers[Package.TYPE_DATA] = handleData;
