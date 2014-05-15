var util = require('util');
var handler = require('./common/handler');
var protocol = require('pomelo-protocol');
var Package = protocol.Package;
var EventEmitter = require('events').EventEmitter;
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var ST_INITED = 0;
var ST_WAIT_ACK = 1;
var ST_WORKING = 2;
var ST_CLOSED = 3;

var Socket = function(id, socket, peer) {
	EventEmitter.call(this);
	
  this.id = id;
	this.socket = socket;
  this.peer = peer;
	this.host = peer.address;
	this.port = peer.port;
	this.remoteAddress = {
    ip: this.host,
    port: this.port
  };

  var self = this;
  this.on('package', function(pkg) {
    if(!!pkg) {
      pkg = Package.decode(pkg);
      handler(self, pkg);
    }
  });

  this.state = ST_INITED;
};

util.inherits(Socket, EventEmitter);

module.exports = Socket;

/**
 * Send byte data package to client.
 *
 * @param  {Buffer} msg byte data
 */
Socket.prototype.send = function(msg) {
  if(this.state !== ST_WORKING) {
    return;
  }
  if(msg instanceof String) {
    msg = new Buffer(msg);
  } else if(!(msg instanceof Buffer)) {
    msg = new Buffer(JSON.stringify(msg));
  }
  this.sendRaw(Package.encode(Package.TYPE_DATA, msg));
};

Socket.prototype.sendRaw = function(msg) {
	this.socket.send(msg, 0, msg.length, this.port, this.host, function(err, bytes) {
    if(!!err)	{
      logger.error('send msg to remote with err: %j', err.stack);
      return;
    }
  });
};

Socket.prototype.sendForce = function(msg) {
  if(this.state === ST_CLOSED) {
    return;
  }
  this.sendRaw(msg);
};

Socket.prototype.handshakeResponse = function(resp) {
  if(this.state !== ST_INITED) {
    return;
  }
  this.sendRaw(resp);
  this.state = ST_WAIT_ACK;
};

Socket.prototype.sendBatch = function(msgs) {
  if(this.state !== ST_WORKING) {
    return;
  }
  var rs = [];
  for(var i=0; i<msgs.length; i++) {
    var src = Package.encode(Package.TYPE_DATA, msgs[i]);
    rs.push(src);
  }
  this.sendRaw(Buffer.concat(rs));
};

Socket.prototype.disconnect = function() {
  if(this.state === ST_CLOSED) {
    return;
  }
  this.state = ST_CLOSED;
  this.emit('disconnect', 'the connection is disconnected.');
};