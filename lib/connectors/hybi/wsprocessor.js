var HttpServer = require('http').Server;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var WebSocketServer = require('ws').Server;

var ST_STARTED = 1;
var ST_CLOSED = 2;

/**
 * websocket protocol processor
 */
var Processor = function() {
  EventEmitter.call(this);
  this.mockServer = new MockServer();

  var self = this;
  this.wsServer = new WebSocketServer({server: this.mockServer});

  this.wsServer.on('connection', function(socket) {
    // emit socket to outside
    self.emit('connection', socket);
  });

  this.state = ST_STARTED;
};
util.inherits(Processor, EventEmitter);

module.exports = Processor;

Processor.prototype.add = function(socket, data) {
  if(this.state !== ST_STARTED) {
    return;
  }
  this.mockServer.emit('connection', socket);
  socket.emit('data', data);
};

Processor.prototype.close = function() {
  if(this.state !== ST_STARTED) {
    return;
  }
  this.state = ST_CLOSED;
  this.wsServer.close();
  this.wsServer = null;
  this.mockServer = null;
};

var MockServer = function() {
  HttpServer.call(this);
};

util.inherits(MockServer, HttpServer);