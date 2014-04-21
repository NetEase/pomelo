var util = require('util');
var EventEmitter = require('events').EventEmitter;
var SioSocket = require('./siosocket');

var PKG_ID_BYTES = 4;
var PKG_ROUTE_LENGTH_BYTES = 1;
var PKG_HEAD_BYTES = PKG_ID_BYTES + PKG_ROUTE_LENGTH_BYTES;

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
  if(typeof port == 'string' && port.indexOf(';') > 0) {
    this.ports = port.split(';');
  } else {
    this.ports = [port];
  }
  this.wsockets = [];
  this.host = host;
  this.opts = opts;
};

util.inherits(Connector, EventEmitter);

module.exports = Connector;

/**
 * Start connector to listen the specified port
 */
Connector.prototype.start = function(cb) {
  var self = this;
  // issue https://github.com/NetEase/pomelo-cn/issues/174
  if(!!this.opts.transports) {
    for(var i=0; i<this.ports.length; i++) {
      this.wsockets.push(require('socket.io').listen(parseInt(this.ports[i],10), this.opts.transports));
    }
  }
  else {
    for(var i=0; i<this.ports.length; i++) {
      this.wsockets.push(require('socket.io').listen(parseInt(this.ports[i],10), {
        transports: [
        'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
        ]
      }));
    }
  }

  for(var i=0; i<this.wsockets.length; i++) {
    this.wsockets[i].set('log level', 1);
    this.wsockets[i].sockets.on('connection', function (socket) {
      var siosocket = new SioSocket(curId++, socket);
      self.emit('connection', siosocket);
      siosocket.on('closing', function(reason) {
        if(reason === 'kick') {
          siosocket.send({route: 'onKick'});
        }
      });
    });
  }

  process.nextTick(cb);
};

/**
 * Stop connector
 */
Connector.prototype.stop = function(force, cb) {
  for(var i=0; i<this.wsockets; i++) {
    this.wsockets[i].server.close();
  }
  process.nextTick(cb);
};

Connector.encode = Connector.prototype.encode = function(reqId, route, msg) {
  if(reqId) {
    return composeResponse(reqId, route, msg);
  } else {
    return composePush(route, msg);
  }
};

/**
 * Decode client message package.
 *
 * Package format:
 *   message id: 4bytes big-endian integer
 *   route length: 1byte
 *   route: route length bytes
 *   body: the rest bytes
 *
 * @param  {String} data socket.io package from client
 * @return {Object}      message object
 */
Connector.decode = Connector.prototype.decode = function(msg) {
  var index = 0;

  var id = parseIntField(msg, index, PKG_ID_BYTES);
  index += PKG_ID_BYTES;

  var routeLen = parseIntField(msg, index, PKG_ROUTE_LENGTH_BYTES);

  var route = msg.substr(PKG_HEAD_BYTES, routeLen);
  var body = msg.substr(PKG_HEAD_BYTES + routeLen);

  return {
    id: id,
    route: route,
    body: JSON.parse(body)
  };
};

var composeResponse = function(msgId, route, msgBody) {
  return {
    id: msgId,
    body: msgBody
  };
};

var composePush = function(route, msgBody) {
  return JSON.stringify({route: route, body: msgBody});
};

var parseIntField = function(str, offset, len) {
  var res = 0;
  for(var i=0; i<len; i++) {
    if(i > 0) {
      res <<= 8;
    }
    res |= str.charCodeAt(offset + i) & 0xff;
  }

  return res;
};