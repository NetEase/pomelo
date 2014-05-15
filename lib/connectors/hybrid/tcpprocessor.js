var EventEmitter = require('events').EventEmitter;
var util = require('util');
var utils = require('../../util/utils');
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
                                         headHandler: utils.headHandler,
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