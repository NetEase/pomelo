var EventEmitter = require('events').EventEmitter;
var util = require('util');
var TcpSocket = require('./tcpsocket');

var ST_STARTED = 1;
var ST_CLOSED = 2;

// private protocol, no need exports
var HEAD_SIZE = 4;

/**
 * websocket protocol processor
 */
var Processor = function(closeMethod) {
  EventEmitter.call(this);
  this.closeMethod = closeMethod;
  this.state = ST_STARTED;
};
util.inherits(Processor, EventEmitter);

module.exports = Processor;

Processor.prototype.add = function(socket, data) {
  if(this.state !== ST_STARTED) {
    return;
  }

  var tcpsocket = new TcpSocket(socket, {headSize: HEAD_SIZE,
                                         headHandler: headHandler,
                                         closeMethod: this.closeMethod});
  this.emit('connection', tcpsocket);
  socket.emit('data', data);
};

Processor.prototype.close = function() {
  if(this.state !== ST_STARTED) {
    return;
  }
  this.state = ST_CLOSED;
};

/**
 * Parse head to caculate body size.
 * Format as below:
 * Head: 4byte.
 * 0: type & flags
 * 1 - 3: body length
 */
var headHandler = function(headBuffer) {
  var len = 0;
  for(var i=1; i<HEAD_SIZE; i++) {
    if(i > 1) {
      len <<= 8;
    }
    len += headBuffer.readUInt8(i);
  }

  return len;
};