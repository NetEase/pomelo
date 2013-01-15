var util = require('util');
var EventEmitter = require('events').EventEmitter;
var protocol = require('pomelo-protocol');

var ST_INITED = 0;
var ST_CLOSED = 1;

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
    }

    self.emit('message', msg);
  });

  this.state = ST_INITED;

  // TODO: any other events?
};

util.inherits(Socket, EventEmitter);

module.exports = Socket;

Socket.prototype.send = function(msg) {
  if(this.state !== ST_INITED) {
    return;
  }
  this.socket.send(msg);
};

Socket.prototype.disconnect = function() {
  if(this.state === ST_CLOSED) {
    return;
  }

  this.state = ST_CLOSED;
  this.socket.close();
};