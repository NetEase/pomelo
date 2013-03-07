var EventEmitter = require('events').EventEmitter;
var util = require('util');
var WSProcessor = require('./wsprocessor');
var TCPProcessor = require('./tcpprocessor');

var HTTP_METHODS = [
  'GET', 'POST', 'DELETE', 'PUT', 'HEAD'
];

var ST_STARTED = 1;
var ST_CLOSED = 2;

/**
 * Switcher for tcp and websocket protocol
 *
 * @param {Object} server tcp server instance from node.js net module
 */
var Switcher = function(server) {
  EventEmitter.call(this);
  this.server = server;
  this.wsprocessor = new WSProcessor();
  this.tcpprocessor = new TCPProcessor();

  this.server.on('connection', this.newSocket.bind(this));
  this.wsprocessor.on('connection', this.emit.bind(this, 'connection'));
  this.tcpprocessor.on('connection', this.emit.bind(this, 'connection'));

  this.state = ST_STARTED;
};
util.inherits(Switcher, EventEmitter);

module.exports = Switcher;

Switcher.prototype.newSocket = function(socket) {
  if(this.state !== ST_STARTED) {
    return;
  }

  var self = this;
  socket.once('data', function(data) {
    if(isHttp(data)) {
      processHttp(self, self.wsprocessor, socket, data);
    } else {
      processTcp(self, self.tcpprocessor, socket, data);
    }
  });
};

Switcher.prototype.close = function() {
  if(this.state !== ST_STARTED) {
    return;
  }

  this.state = ST_CLOSED;
  this.wsprocessor.close();
  this.tcpprocessor.close();
};

var isHttp = function(data) {
  var head = data.toString('utf8', 0, 4);

  for(var i=0, l=HTTP_METHODS.length; i<l; i++) {
    if(head.indexOf(HTTP_METHODS[i]) === 0) {
      return true;
    }
  }

  return false;
};

var processHttp = function(switcher, processor, socket, data) {
  processor.add(socket, data);
};

var processTcp = function(switcher, processor, socket, data) {
  processor.add(socket, data);
};
