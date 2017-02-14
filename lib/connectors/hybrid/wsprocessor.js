'use strict';

const HttpServer = require('http').Server;
const EventEmitter = require('events').EventEmitter;
const util = require('util');

const WebSocketServer = require('ws').Server;

const ST_STARTED = 1;
const ST_CLOSED = 2;

/**
 * websocket protocol processor
 */
module.exports = Processor;

function Processor() {
  EventEmitter.call(this);

  this.httpServer = new HttpServer();

  this.wsServer = new WebSocketServer({server: this.httpServer});
  this.wsServer.on('connection', (socket) => {
    this.emit('connection', socket);
  });

  this.state = ST_STARTED;
}
util.inherits(Processor, EventEmitter);

Processor.prototype.add = function(socket, data) {
  if (this.state !== ST_STARTED) {
    return;
  }

  this.httpServer.emit('connection', socket);

  if (typeof socket.ondata === 'function') {
    // compatible with stream2
    socket.ondata(data, 0, data.length);
  } else {
    // compatible with old stream
    socket.emit('data', data);
  }
};

Processor.prototype.close = function() {
  if (this.state !== ST_STARTED) {
    return;
  }

  this.state = ST_CLOSED;
  this.wsServer.close();
  this.wsServer = null;
  this.httpServer = null;
};
