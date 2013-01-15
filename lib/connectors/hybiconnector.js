var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HybiSocket = require('./hybisocket');
var Switcher = require('./hybi/switcher');

var curId = 1;

/**
 * Connector that manager low level connection and protocol bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol, such as tcp or probuf.
 */
var Connector = function(port) {
  if (!(this instanceof Connector)) {
    return new Connector(port);
  }

  EventEmitter.call(this);
  this.port = port;

  this.switcher = null;
};

util.inherits(Connector, EventEmitter);

module.exports = Connector;

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function() {
  var self = this;
  this.tcpServer = net.createServer();
  this.switcher = new Switcher(this.tcpServer);

  this.switcher.on('connection', function(socket) {
    self.emit('connection', new HybiSocket(curId++, socket));
  });

  this.tcpServer.listen(this.port);
};
