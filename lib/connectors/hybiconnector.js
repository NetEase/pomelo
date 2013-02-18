var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HybiSocket = require('./hybisocket');
var Switcher = require('./hybi/switcher');
var Handshake = require('./commands/handshake');
var Heartbeat = require('./commands/heartbeat');
var Kick = require('./commands/kick');

var curId = 1;

/**
 * Connector that manager low level connection and protocol bewteen server and client.
 * Develper can provide their own connector to switch the low level prototol, such as tcp or probuf.
 */
var Connector = function(port, host, opts) {
  if (!(this instanceof Connector)) {
    return new Connector(port, host, opts);
  }

  EventEmitter.call(this);
  this.port = port;

  opts = opts || {};

  this.handshake = new Handshake(opts);
  this.heartbeat = new Heartbeat(opts);

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
    var hybisocket = new HybiSocket(curId++, socket);

    hybisocket.on('handshake',
      self.handshake.handle.bind(self.handshake, hybisocket));

    hybisocket.on('heartbeat',
      self.heartbeat.handle.bind(self.heartbeat, hybisocket));

    hybisocket.on('disconnect',
      self.heartbeat.clear.bind(self.heartbeat, hybisocket.id));

    hybisocket.on('closing', Kick.handle.bind(null, hybisocket));

    self.emit('connection', hybisocket);
  });

  this.tcpServer.listen(this.port);
};

Connector.prototype.close = function() {
  this.switcher.close();
  this.tcpServer.close();
};

Connector.prototype.composeResponse = function(msgId, route, msgBody) {
  // TODO: add message head
  return msgBody;
};

Connector.prototype.composePush = function(route, msgBody) {
  // TODO: add message head
  return msgBody;
};