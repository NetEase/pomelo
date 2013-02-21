var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HybiSocket = require('./hybisocket');
var Switcher = require('./hybi/switcher');
var Handshake = require('./commands/handshake');
var Heartbeat = require('./commands/heartbeat');
var protocol = require('pomelo-protocol');
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
  var app = require('../../../pomelo').app;

  if(!msgId || !route || !msgBody){
    console.error('error msg : %j, %j', route, msgBody);
    return null;
  }
  var protobuf = app.components.__protobuf__;
  var dict = app.components.__dictionary__.getDict();

  if(typeof msgBody !== 'string'){
    msgBody = JSON.stringify(msgBody);
  }

  var flag = 0;
  console.error('response route : %j, msg : %j', route, JSON.parse(msgBody));

  // TODO: add message head
  var protos = protobuf.getProtos().server;
  if(!!protos[route]){
    var buffer = protobuf.encode2Bytes(route, JSON.parse(msgBody));

    //print statistic
    statistic(Buffer.byteLength(msgBody), buffer.length, route);

    msgBody = buffer;
    //console.error(protobuf.encode(route, JSON.parse(msg)));
  }else{
    console.warn('msg not compress : %j', route);
    msgBody = protocol.strencode(msgBody);
  }

  //change route
  // if(!!dict[route]){
  //   route = dict[route];
  //   flag = flag|0x01;
  // }

  return protocol.body.encode(msgId, 0, route, msgBody);
};

Connector.prototype.composePush = function(route, msgBody) {
  var app = require('../../../pomelo').app;

  if(!route || !msgBody){
    console.error('error msg : %j, %j', route, msgBody);
    return null;
  }
  var protobuf = app.components.__protobuf__;
  var dict = app.components.__dictionary__.getDict();

  if(typeof msgBody !== 'string'){
    msgBody = JSON.stringify(msgBody);
  }

  var flag = 0;
  console.error('route : %j, msg : %j', route, JSON.parse(msgBody));

  // TODO: add message head
  var protos = protobuf.getProtos().server;
  if(!!protos[route]){
    var buffer = protobuf.encode2Bytes(route, JSON.parse(msgBody));

    //Compute compress rate
    statistic(Buffer.byteLength(msgBody), buffer.length, route);

    msgBody = buffer;
    //console.error(protobuf.encode(route, JSON.parse(msg)));
  }else{
    console.warn('msg not compress : %j', route);
    msgBody = protocol.strencode(msgBody);
  }

  //change route
  if(!!dict[route]){
    route = dict[route];
    flag = flag|0x01;
  }

  return protocol.body.encode(0, flag, route, msgBody);
  // return {
  //   route : route,
  //   body : msgBody
  // };
};
var compressRate = 0;
var msgCount = 0;
var averageLength = 0;

function statistic(l1, l2, route){
  var rate = l2/l1;

  compressRate = (compressRate*msgCount + rate)/(++msgCount);
  averageLength = (averageLength*msgCount + l2)/(++msgCount);
  console.info('msg route : %j, origin length : %j, compressed length : %j, compress rate : %j, all msg count : %j, average compress rate : %j, average byte length : %j', route, l1, l2, Math.floor(rate*100)/100, msgCount, Math.floor(compressRate*100)/100, Math.floor(averageLength*100)/100);
}
