var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HybridSocket = require('./hybridsocket');
var Switcher = require('./hybrid/switcher');
var Handshake = require('./commands/handshake');
var Heartbeat = require('./commands/heartbeat');
var Kick = require('./commands/kick');
var Message = require('pomelo-protocol').Message;
var Constants = require('../util/constants');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

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

  opts = opts || {};

  this.port = port;
  this.host = host;
  this.useDict = opts.useDict;
  this.useProtobuf = opts.useProtobuf;
  this.handshake = new Handshake(opts);
  this.heartbeat = new Heartbeat(opts);
  this.distinctHost = opts.distinctHost;
  this.closeMethod = opts.closeMethod;
  this.timeout = opts.timeout;

  this.switcher = null;
};

util.inherits(Connector, EventEmitter);

module.exports = Connector;

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function(cb) {
  var app = require('../pomelo').app;
  var self = this;

  this.tcpServer = net.createServer();
  this.switcher = new Switcher(this.tcpServer, self.timeout, self.closeMethod);
  
  this.connector = app.components.__connector__.connector;
  this.dictionary = app.components.__dictionary__;
  this.protobuf = app.components.__protobuf__;
  this.decodeIO_protobuf = app.components.__decodeIO__protobuf__;

  
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

  if(!!this.distinctHost) {
    this.tcpServer.listen(this.port, this.host);
  } else {
    this.tcpServer.listen(this.port);
  }

  process.nextTick(cb);
};

Connector.prototype.stop = function(force, cb) {
  this.switcher.close();
  this.tcpServer.close();

  process.nextTick(cb);
};

Connector.encode = Connector.prototype.encode = function(reqId, route, msg) {
  if(!!reqId) {
    return composeResponse(this, reqId, route, msg);
  } else {
    return composePush(this, route, msg);
  }
};

Connector.decode = Connector.prototype.decode = function(msg) {
  msg = Message.decode(msg.body);
  var route = msg.route;

  // decode use dictionary
  if(!!msg.compressRoute) {
    if(!!this.connector.useDict) {
      var abbrs = this.dictionary.getAbbrs();
      if(!abbrs[route]) {
        logger.error('dictionary error! no abbrs for route : %s', route);
        return null;
      }
      route = msg.route = abbrs[route];
    } else {
      logger.error('fail to uncompress route code for msg: %j, server not enable dictionary.', msg);
      return null;
    }
  }

  // decode use protobuf
  if(!!this.protobuf && !!this.protobuf.getProtos().client[route]) {
    msg.body = this.protobuf.decode(route, msg.body);
  } else if(!!this.decodeIO_protobuf && !!this.decodeIO_protobuf.check(Constants.RESERVED.CLIENT, route)) {
    msg.body = this.decodeIO_protobuf.decode(route, msg.body);
  } else {
    msg.body = JSON.parse(msg.body.toString('utf8'));
  }

  return msg;
};

var composeResponse = function(server, msgId, route, msgBody) {
  if(!msgId || !route || !msgBody) {
    return null;
  }
  msgBody = encodeBody(server, route, msgBody);
  return Message.encode(msgId, Message.TYPE_RESPONSE, 0, null, msgBody);
};

var composePush = function(server, route, msgBody) {
  if(!route || !msgBody){
    return null;
  }
  msgBody = encodeBody(server, route, msgBody);
  // encode use dictionary
  var compressRoute = 0;
  var dict = server.dictionary.getDict();
  if(!!server.connector.useDict && !!dict[route]) {
    route = dict[route];
    compressRoute = 1;
  }
  return Message.encode(0, Message.TYPE_PUSH, compressRoute, route, msgBody);
};

var encodeBody = function(server, route, msgBody) {
    // encode use protobuf
  if(!!server.protobuf && !!server.protobuf.getProtos().server[route]) {
    msgBody = server.protobuf.encode(route, msgBody);
  } else if(!!server.decodeIO_protobuf && !!server.decodeIO_protobuf.check(Constants.RESERVED.SERVER, route)) {
     msgBody = server.decodeIO_protobuf.encode(route, msgBody);
  } else {
    msgBody = new Buffer(JSON.stringify(msgBody), 'utf8');
  }
  return msgBody;
};
