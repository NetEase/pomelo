var util = require('util');
var EventEmitter = require('events').EventEmitter;
var protocol = require('pomelo-protocol');
var logger = require('pomelo-logger').getLogger(__filename);
var Package = protocol.Package;
var Message = protocol.Message;

var ST_INITED = 0;
var ST_WAIT_ACK = 1;
var ST_WORKING = 2;
var ST_CLOSED = 3;

/**
 * Socket class that wraps socket and websocket to provide unified interface for up level.
 */
var Socket = function(id, socket) {
  EventEmitter.call(this);
  this.id = id;
  this.socket = socket;
  this.remoteAddress = {
    ip: socket._socket.remoteAddress,
    port: socket._socket.remotePort
  };

  var self = this;

  socket.on('close', this.emit.bind(this, 'disconnect'));
  socket.on('error', this.emit.bind(this, 'error'));

  socket.on('message', function(msg) {
    if(msg) {
      msg = Package.decode(msg);
      handle(self, msg);
    }
  });

  this.state = ST_INITED;

  // TODO: any other events?
};

util.inherits(Socket, EventEmitter);

module.exports = Socket;

/**
 * Send raw byte data.
 *
 * @api private
 */
Socket.prototype.sendRaw = function(msg) {
  if(this.state !== ST_WORKING) {
    return;
  }

  this.socket.send(msg, {binary: true});
};

/**
 * Send byte data package to client.
 *
 * @param  {Buffer} msg byte data
 */
Socket.prototype.send = function(msg) {
  if(msg instanceof String) {
    msg = new Buffer(msg);
  } else if(!(msg instanceof Buffer)) {
    msg = new Buffer(JSON.stringify(msg));
  }

  this.sendRaw(Package.encode(Package.TYPE_DATA, msg));
};

Socket.prototype.sendBatch = function(msgs) {
  for(var i=0, l=msgs.length; i<l; i++) {
    this.send(msgs[i]);
  }
};

/**
 * Send message to client no matter whether handshake.
 *
 * @api private
 */
Socket.prototype.sendForce = function(msg) {
  if(this.state === ST_CLOSED) {
    return;
  }
  this.socket.send(msg, {binary: true});
};

/**
 * Response handshake request
 *
 * @api private
 */
Socket.prototype.handshakeResponse = function(resp) {
  if(this.state !== ST_INITED) {
    return;
  }
  this.socket.send(resp, {binary: true});
  this.state = ST_WAIT_ACK;
};

Socket.prototype.disconnect = function() {
  if(this.state === ST_CLOSED) {
    return;
  }

  this.state = ST_CLOSED;
  this.socket.close();
};

var handle = function(socket, msg) {
  var handler = handlers[msg.type];
  if(handler) {
    handler(socket, msg);
  }
};

var handleHandshake = function(socket, msg) {
  if(socket.state !== ST_INITED) {
    return;
  }

  socket.emit('handshake', JSON.parse(protocol.strdecode(msg.body)));
};

var handleHandshakeAck = function(socket, msg) {
  if(socket.state !== ST_WAIT_ACK) {
    return;
  }

  socket.state = ST_WORKING;
  socket.emit('heartbeat');
};

var handleHeartbeat = function(socket, msg) {
  if(socket.state !== ST_WORKING) {
    return;
  }
  socket.emit('heartbeat');
};

var handleData = function(socket, msg) {
  if(socket.state !== ST_WORKING) {
    return;
  }

  var app = require('../../../pomelo').app;
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
        return;
      }

      msg.route = abbrs[msg.route];
    } else {
      logger.error('fail to uncompress route code for ' +
                   'server not enable dictionary.');
      return;
    }
  }

  //Protobuf decode for client message
  if(connector.useProtobuf) {
    var protos = protobuf.getProtos().client||{};
    if(!!protos[msg.route]){
      msg.body = protobuf.decode(msg.route, msg.body);
    } else {
      msg.body = protocol.strdecode(msg.body);
    }
  } else {
    msg.body = protocol.strdecode(msg.body);
  }

  socket.emit('message', msg);
};

var handlers = {};
handlers[Package.TYPE_HANDSHAKE] = handleHandshake;
handlers[Package.TYPE_HANDSHAKE_ACK] = handleHandshakeAck;
handlers[Package.TYPE_HEARTBEAT] = handleHeartbeat;
handlers[Package.TYPE_DATA] = handleData;
