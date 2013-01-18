var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sio = require('socket.io');
var SioSocket = require('./siosocket');

var curId = 1;

/**
 * Connector that manager low level connection and protocol bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol, such as tcp or probuf.
 */
var Connector = function(port, host) {
  if (!(this instanceof Connector)) {
    return new Connector(port, host);
  }

  EventEmitter.call(this);
  this.port = port;
  this.host = host;
};

util.inherits(Connector, EventEmitter);

module.exports = Connector;

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function() {
  var self = this;
  console.error('ccccccccccccccccccc' + this.port);
	this.wsocket = sio.listen(this.port);
  this.wsocket.set('log level', 1);
  this.wsocket.sockets.on('connection', function (socket) {
		console.log('new connection');
    self.emit('connection', new SioSocket(curId++, socket));
  });
};

/**
 * Stop connector
 */
Connector.prototype.stop = function() {
  this.wsocket.server.close();
};
