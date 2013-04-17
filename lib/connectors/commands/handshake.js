var protocol = require('pomelo-protocol');
var pomelo = require('../../pomelo');
var Package = require('pomelo-protocol').Package;


var CODE_OK = 200;
var CODE_USE_ERROR = 500;
var CODE_OLD_CLIENT = 501;

/**
 * Process the handshake request.
 *
 * @param {Object} opts option parameters
 *                      opts.handshake(msg, cb(err, resp)) handshake callback. msg is the handshake message from client.
 *                      opts.hearbeat heartbeat interval (level?)
 *                      opts.version required client level
 */
var Command = function(opts) {
  opts = opts || {};
  this.userHandshake = opts.handshake;

  if(opts.heartbeat) {
    this.heartbeatSec = opts.heartbeat;
    this.heartbeat = opts.heartbeat * 1000;
  }

  this.checkClient = opts.checkClient;

  this.useDict = opts.useDict;
  this.useProtobuf = opts.useProtobuf;
};

module.exports = Command;

Command.prototype.handle = function(socket, msg) {
  if(typeof this.checkClient === 'function') {
    if(!msg || !msg.sys || !this.checkClient(msg.sys.type, msg.sys.version)) {
      processError(socket, CODE_OLD_CLIENT);
      return;
    }
  }

  var opts = {
    heartbeat : setupHeartbeat(this, msg)
  };

  if(this.useDict) {
    opts.dict = pomelo.app.components.__dictionary__.getDict();
  }

  if(this.useProtobuf) {
    opts.protos = pomelo.app.components.__protobuf__.getProtos();
  }

  if(typeof this.userHandshake === 'function') {
    this.userHandshake(msg, function(err, resp) {
      if(err) {
        process.nextTick(function() {
          processError(socket, CODE_USE_ERROR);
        });
        return;
      }

      process.nextTick(function() {
        response(socket, opts, resp);
      });
    });
    return;
  }

  process.nextTick(function() {
    response(socket, opts);
  });
};

var setupHeartbeat = function(self, msg) {
  return self.heartbeatSec;
};

var response = function(socket, sys, resp) {
  var res = {
    code: 200,
    sys: sys
  };

  if(resp) {
    res.user = resp;
  }

  socket.handshakeResponse(Package.encode(Package.TYPE_HANDSHAKE,
                           new Buffer(JSON.stringify(res))));
};

var processError = function(socket, code) {
  var res = {
    code: code
  };
  socket.sendForce(Package.encode(Package.TYPE_HANDSHAKE,
                   new Buffer(JSON.stringify(res))));

  process.nextTick(function() {
    socket.disconnect();
  });
};