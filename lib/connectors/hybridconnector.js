var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HybridSocket = require('./hybridsocket');
var Switcher = require('./hybrid/switcher');
var Handshake = require('./commands/handshake');
var Heartbeat = require('./commands/heartbeat');
var protocol = require('pomelo-protocol');
var Kick = require('./commands/kick');
var Message = require('pomelo-protocol').Message;
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
  this.timeout = opts.timeout;

  this.switcher = null;
};

util.inherits(Connector, EventEmitter);

module.exports = Connector;

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function(cb) {
  var self = this;
  this.tcpServer = net.createServer();
  this.switcher = new Switcher(this.tcpServer, self.timeout);

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

  if(this.distinctHost) {
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
  if(reqId) {
    return composeResponse(reqId, route, msg);
  } else {
    return composePush(route, msg);
  }
};

Connector.decode = Connector.prototype.decode = function(msg) {
  var app = require('../pomelo').app;
  var connector = app.components.__connector__.connector;
  var dictionary = app.components.__dictionary__;
  var protobuf = app.components.__protobuf__;

  msg = Message.decode(msg.body);

  if(msg.compressRoute) {
    if(connector.useDict) {
      var abbrs = dictionary.getAbbrs();
      if(!abbrs[msg.route]) {
        //ignore route error msg
        logger.error('dictionary error! no abbrs for route : %j', msg.route);
        return null;
      }

      msg.route = abbrs[msg.route];
    } else {
      logger.error('fail to uncompress route code for ' +
                   'server not enable dictionary.');
      return null;
    }
  }

  //Protobuf decode for client message
  if(connector.useProtobuf) {
    var protos = protobuf.getProtos().client || {};
    if(!!protos[msg.route]){
      msg.body = protobuf.decode(msg.route, msg.body);
    } else {
      msg.body = JSON.parse(msg.body.toString('utf8'));
    }
  } else {
    msg.body = JSON.parse(msg.body.toString('utf8'));
  }

  return msg;
};

var composeResponse = function(msgId, route, msgBody) {
  if(!msgId || !route || !msgBody) {
    return null;
  }

  msgBody = encodeBody(route, msgBody);

  return Message.encode(msgId, Message.TYPE_RESPONSE, 0, null, msgBody);
};

var composePush = function(route, msgBody) {
  //Filter illigel message
  if(!route || !msgBody){
    return null;
  }

  msgBody = encodeBody(route, msgBody);

  // encode route with dictionary if necessary
  var app = require('../pomelo').app;
  var connector = app.components.__connector__.connector;
  var compressRoute = 0;
  if(!!connector.useDict){
    var dict = app.components.__dictionary__.getDict();
    if(connector.useDict && dict[route]) {
      route = dict[route];
      compressRoute = 1;
    }
  }
  return Message.encode(0, Message.TYPE_PUSH, compressRoute, route, msgBody);
};

// js object body to buffer
var encodeBody = function(route, msgBody) {
  var app = require('../pomelo').app;
  var connector = app.components.__connector__.connector;
  var protobuf = app.components.__protobuf__;

  if(connector.useProtobuf && protobuf.getProtos().server[route]) {
    // js object to buffer by protobuf
    msgBody = protobuf.encode(route, msgBody);
  } else {
    // js object to buffer by json
    msgBody = new Buffer(JSON.stringify(msgBody), 'utf8');
  }

  return msgBody;
};
