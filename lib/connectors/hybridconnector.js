var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HybridSocket = require('./hybridsocket');
var Switcher = require('./hybrid/switcher');
var Handshake = require('./commands/handshake');
var Heartbeat = require('./commands/heartbeat');
var protocol = require('pomelo-protocol');
var Kick = require('./commands/kick');
var protocol = require('pomelo-protocol');
var Message = require('pomelo-protocol').Message;

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
  this.host = host;

  opts = opts || {};

  this.useDict = opts.useDict;
  this.useProtobuf = opts.useProtobuf;
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
    var hybridsocket = new HybridSocket(curId++, socket);

    hybridsocket.on('handshake',
      self.handshake.handle.bind(self.handshake, hybridsocket));

    hybridsocket.on('heartbeat',
      self.heartbeat.handle.bind(self.heartbeat, hybridsocket));

    hybridsocket.on('disconnect',
      self.heartbeat.clear.bind(self.heartbeat, hybridsocket.id));

    hybridsocket.on('closing', Kick.handle.bind(null, hybridsocket));

    self.emit('connection', hybridsocket);
  });

  this.tcpServer.listen(this.port, this.host);
};

Connector.prototype.stop = function() {
  this.switcher.close();
  this.tcpServer.close();
};

Connector.prototype.composeResponse = function(msgId, route, msgBody) {
  if(!msgId || !route || !msgBody){
    console.error('error msg : %j, %j', route, msgBody);
    return null;
  }

  var app = require('../../../pomelo').app;
  var protobuf = app.components.__protobuf__;
  var dict = app.components.__dictionary__.getDict();

  if(typeof msgBody !== 'string'){
    msgBody = JSON.stringify(msgBody);
  }

  var flag = 0;
  //console.error('response route : %j, msg : %j', route, JSON.parse(msgBody));

  var protos = protobuf.getProtos().server;
  if(!!protos[route]){
    msgBody = protobuf.encode2Bytes(route, JSON.parse(msgBody));
  }else{
    msgBody = protocol.strencode(msgBody);
  }

  //change route
  var compressRoute = 0;
  if(!!dict[route]){
    route = dict[route];
    compressRoute = 1;
  }

  return Message.encode(msgId, Message.TYPE_RESPONSE, 0,
                        null, msgBody);

};

Connector.prototype.composePush = function(route, msgBody) {
  //Filter illigel message
  if(!route || !msgBody){
    console.error('error msg : %j, %j', route, msgBody);
    return null;
  }

  var app = require('../../../pomelo').app;
  var connector = app.components.__connector__.connector;
  var protobuf = app.components.__protobuf__;
  var dict = app.components.__dictionary__.getDict();

  // Protobuf encode or normal encode
  var protos = protobuf.getProtos().server;
  if(connector.useProtobuf && protos[route]){
    //Translate msgBody to object
    msgBody = (typeof msgBody === 'string')?JSON.parse(msgBody):msgBody;
    //Encode string to buffer
    msgBody = protobuf.encode2Bytes(route, msgBody);
  }else{
    //Translate msgBody to string
    msgBody = (typeof msgBody === 'string') ? msgBody : JSON.stringify(msgBody);
    //Encode string to buffer
    msgBody = protocol.strencode(msgBody);
  }

  //change route with dictionary
  var compressRoute = 0;

  if(connector.useDict && !!dict[route]){
    route = dict[route];
    compressRoute = 1;
  }

  return Message.encode(0, Message.TYPE_PUSH, compressRoute,
                        route, msgBody);
};
